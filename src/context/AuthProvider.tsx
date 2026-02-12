import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ApolloClient,
    ApolloProvider,
    HttpLink,
    InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { FirebaseError } from "firebase/app";
import {
    GithubAuthProvider,
    onIdTokenChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    User as FirebaseUser,
} from "firebase/auth";

import { auth } from "@/core/firebase/firebaseInit";
import { ME, UPSERT_SELF, HAS_UPSERT_SELF } from "@/core/graphql/user/user.gql";
import {
    AuthContext,
    Role,
    AppUser,
    LoginResult,
    LoginErrorTarget,
} from "./authContext";

const KNOWN_ROLES: Role[] = ["ADMIN", "RM", "STAFF", "MARKETING", "ANALYST"];

type MeQueryResult = {
    me: {
        id: string;
        name: string;
        email: string;
        role: string;
        status?: string | null;
    } | null;
};

type HasUpsertSelfQueryResult = {
    __type: {
        fields: { name: string }[];
    } | null;
};

type LoginErrorDescriptor = {
    title: string;
    message: string;
    target?: LoginErrorTarget;
    fieldMessage?: string;
    variant?: "error" | "warning";
};

const AUTH_ERROR_MESSAGES: Record<string, LoginErrorDescriptor> = {
    "auth/wrong-password": {
        title: "Incorrect password",
        message: "Please check your password and try again.",
        target: "password",
        fieldMessage: "The password you entered is incorrect.",
    },
    "auth/invalid-credential": {
        title: "Incorrect password",
        message: "Please check your password and try again.",
        target: "password",
        fieldMessage: "The password you entered is incorrect.",
    },
    "auth/user-not-found": {
        title: "Account not found",
        message:
            "We couldn't find an account for that email. Contact your administrator if you need access.",
        target: "email",
        fieldMessage: "No user exists with this email address.",
    },
    "auth/user-disabled": {
        title: "Account disabled",
        message:
            "Your account has been disabled. Please contact your administrator for help.",
    },
    "auth/too-many-requests": {
        title: "Too many attempts",
        message:
            "We've temporarily locked sign-in because of too many attempts. Please wait a moment and try again.",
        target: "password",
        variant: "warning",
    },
    "auth/api-key-not-valid": {
        title: "Configuration Error",
        message: "The Firebase API Key is invalid. Please check your .env file.",
        variant: "error",
    },
    "auth/configuration-not-found": {
        title: "Auth Not Enabled",
        message: "Email/Password authentication is not enabled in your Firebase Console. Please go to Authentication > Sign-in method and enable it.",
        variant: "error",
    },
};

const DEFAULT_LOGIN_ERROR: LoginErrorDescriptor = {
    title: "Sign-in failed",
    message:
        "We couldn't sign you in. Please try again or contact your administrator.",
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
    children,
}) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [user, setUser] = useState<AppUser | null>(null);
    const [idToken, setIdToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Recreate the Apollo client when token changes (simple & reliable)
    const client = useMemo(() => {
        const uri = import.meta.env.VITE_GRAPHQL_URL || "http://localhost:3333/graphql";
        const httpLink = new HttpLink({ uri });
        const authLink = setContext(async (_, { headers }) => {
            try {
                // Prefer latest token from Firebase if available; fallback to state
                const token = (await auth.currentUser?.getIdToken()) || idToken || null;
                return {
                    headers: {
                        ...headers,
                        Authorization: token ? `Bearer ${token}` : "",
                    },
                };
            } catch {
                return { headers };
            }
        });
        return new ApolloClient({
            link: authLink.concat(httpLink),
            cache: new InMemoryCache(),
        });
    }, [idToken]);

    // one-time schema probe for UPSERT_SELF presence
    const upsertSupportRef = useRef<{ checked: boolean; supported: boolean }>({
        checked: false,
        supported: false,
    });

    const normalizeRole = useCallback((rawRole: string | null | undefined) => {
        if (rawRole && KNOWN_ROLES.includes(rawRole as Role)) {
            return rawRole as Role;
        }
        return "UNKNOWN";
    }, []);

    const loadProfile = useCallback(async () => {
        if (!idToken) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            try {
                const fresh = await auth.currentUser?.getIdToken(true);
                if (fresh) setIdToken(fresh);
            } catch { }

            if (!upsertSupportRef.current.checked) {
                try {
                    const { data: schemaData } =
                        await client.query<HasUpsertSelfQueryResult>({
                            query: HAS_UPSERT_SELF,
                            fetchPolicy: "network-only",
                        });
                    const mutationNames =
                        schemaData.__type?.fields?.map((f) => f.name) ?? [];
                    upsertSupportRef.current.supported =
                        mutationNames.includes("upsertSelf");
                } catch (schemaError) {
                    console.warn("Unable to determine upsertSelf availability", schemaError);
                    upsertSupportRef.current.supported = false;
                } finally {
                    upsertSupportRef.current.checked = true;
                }
            }

            if (upsertSupportRef.current.supported) {
                try {
                    await client.mutate({ mutation: UPSERT_SELF, errorPolicy: "ignore" });
                } catch (mutationError) {
                    console.error("Failed to ensure authenticated user record", mutationError);
                }
            }

            const { data } = await client.query<MeQueryResult>({
                query: ME,
                fetchPolicy: "network-only",
            });

            if (data?.me) {
                console.log("✅ Authenticated user loaded:", data.me.email, "Role:", data.me.role);
                setUser({
                    id: data.me.id,
                    name: data.me.name,
                    email: data.me.email,
                    role: normalizeRole(data.me.role),
                    status: data.me.status ?? null,
                });
            } else {
                console.warn("⚠️ Firebase user authenticated but no record found in app database. Attempting upsert...");

                // If ME returned null, try upserting now regardless of previous check
                try {
                    const upsertResult = await client.mutate({ mutation: UPSERT_SELF });
                    console.log("🆕 Upsert successful:", upsertResult.data);

                    // Try ME one more time
                    const { data: retryData } = await client.query<MeQueryResult>({
                        query: ME,
                        fetchPolicy: "network-only",
                    });

                    if (retryData?.me) {
                        setUser({
                            id: retryData.me.id,
                            name: retryData.me.name,
                            email: retryData.me.email,
                            role: normalizeRole(retryData.me.role),
                            status: retryData.me.status ?? null,
                        });
                        return;
                    }
                } catch (upsertErr) {
                    console.error("❌ Proactive upsert failed:", upsertErr);
                }

                console.error("🚫 Access denied: User not found in database.");
                setUser(null);
                setIdToken(null);
            }
        } catch (error) {
            console.error("❌ Failed to load authenticated user:", error);
            setUser(null);
            setIdToken(null);
        } finally {
            setLoading(false);
        }
    }, [client, idToken, normalizeRole]);

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (current) => {
            if (!current) {
                setFirebaseUser(null);
                setIdToken(null);
                setUser(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setFirebaseUser(current);

            try {
                const token = await current.getIdToken(false);
                setIdToken(token);
                console.log("🔥 Firebase ID Token:", token);
            } catch (error) {
                console.error("Failed to retrieve ID token", error);
                await signOut(auth);
                setFirebaseUser(null);
                setIdToken(null);
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    const login = async (email: string, password: string): Promise<LoginResult> => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);

            if (error instanceof FirebaseError) {
                const info = AUTH_ERROR_MESSAGES[error.code] ?? DEFAULT_LOGIN_ERROR;
                return {
                    success: false,
                    code: error.code,
                    title: info.title,
                    message: info.message,
                    target: info.target,
                    fieldMessage: info.fieldMessage,
                    variant: info.variant ?? "error",
                };
            }

            return {
                success: false,
                title: DEFAULT_LOGIN_ERROR.title,
                message: DEFAULT_LOGIN_ERROR.message,
                variant: "error",
            };
        }
    };

    const loginWithGithub = async (): Promise<LoginResult> => {
        try {
            const provider = new GithubAuthProvider();
            await signInWithPopup(auth, provider);
            return { success: true };
        } catch (error) {
            console.error("GitHub Login failed", error);

            if (error instanceof FirebaseError) {
                const info = AUTH_ERROR_MESSAGES[error.code] ?? DEFAULT_LOGIN_ERROR;
                return {
                    success: false,
                    code: error.code,
                    title: info.title,
                    message: info.message,
                    target: info.target,
                    fieldMessage: info.fieldMessage,
                    variant: info.variant ?? "error",
                };
            }

            return {
                success: false,
                title: DEFAULT_LOGIN_ERROR.title,
                message: DEFAULT_LOGIN_ERROR.message,
                variant: "error",
            };
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await signOut(auth);
        } finally {
            setUser(null);
            setIdToken(null);
            setFirebaseUser(null);
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                firebaseUser,
                user,
                loading,
                idToken,
                login,
                loginWithGithub,
                logout,
                refresh: loadProfile,
            }}
        >
            <ApolloProvider client={client}>{children}</ApolloProvider>
        </AuthContext.Provider>
    );
};

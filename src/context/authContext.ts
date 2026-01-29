import { createContext, useContext } from "react";
import { User as FirebaseUser } from "firebase/auth";

export type Role = "ADMIN" | "RM" | "STAFF" | "MARKETING" | "ANALYST";
export type AppUserRole = Role | "UNKNOWN";

export type AppUser = {
    id: string;
    name: string;
    email: string;
    role: AppUserRole;
    status?: string | null;
};

export type LoginErrorTarget = "email" | "password";
export type LoginFailure = {
    success: false;
    code?: string;
    title: string;
    message: string;
    target?: LoginErrorTarget;
    fieldMessage?: string;
    variant: "error" | "warning";
};
export type LoginResult = { success: true } | LoginFailure;

export type AuthContextType = {
    firebaseUser: FirebaseUser | null;
    user: AppUser | null;
    loading: boolean;
    idToken: string | null;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

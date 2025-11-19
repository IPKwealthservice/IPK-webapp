export function humanize(value?: string | null): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(/_/g, " ")          // handle ENUM_NAME_WITH_UNDERSCORE
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize first letter of each word
}

/**
 * Constructs a full name from name, firstName, and lastName fields.
 * Returns a space-trimmed name or fallback.
 * @param name - Full name field
 * @param firstName - First name field
 * @param lastName - Last name field
 * @param fallback - Fallback value if all fields are empty (default: "-")
 */
export function constructFullName(
  name?: string | null,
  firstName?: string | null,
  lastName?: string | null,
  fallback = "-"
): string {
  if (name?.trim()) return name.trim();
  
  const parts: string[] = [];
  if (firstName?.trim()) parts.push(firstName.trim());
  if (lastName?.trim()) parts.push(lastName.trim());
  
  return parts.length > 0 ? parts.join(" ") : fallback;
}

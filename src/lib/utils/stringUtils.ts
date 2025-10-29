/**
 * Sanitizes a string to be used as a clean technical name (e.g., for code or API identifiers).
 * Removes spaces and all special characters except underscores.
 * @param name The string to sanitize.
 * @returns The sanitized string.
 */
export const sanitizeTechnicalName = (name: string): string => {
  // First, remove all whitespace characters
  let sanitized = name.replace(/\s+/g, '');
  // Then, remove any characters that are not alphanumeric or an underscore
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');
  return sanitized;
};

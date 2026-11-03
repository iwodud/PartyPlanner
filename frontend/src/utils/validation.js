// Minimalna długość hasła zgodna z domyślnym ustawieniem Supabase Auth
export const MIN_PASSWORD_LENGTH = 6;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const isValidEmail = (email) => EMAIL_REGEX.test(email.trim());

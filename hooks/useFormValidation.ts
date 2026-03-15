import { useMemo } from "react";

const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const PASSWORD_REGEX = /^[a-zA-Z\d]{6,}$/;

export const useFormValidation = () => {
  const validateEmail = useMemo(
    () => (email: string) => EMAIL_REGEX.test(email),
    [],
  );

  const validatePassword = useMemo(
    () => (password: string) => PASSWORD_REGEX.test(password),
    [],
  );

  const getEmailError = (email: string): string | undefined => {
    if (email === "") return undefined;
    if (!validateEmail(email)) return "有効なメールアドレスを入力してください";
    return undefined;
  };

  const getPasswordError = (password: string): string | undefined => {
    if (password === "") return undefined;
    if (!validatePassword(password)) return "6文字以上で半角英数字のみ有効です";
    return undefined;
  };

  return { validateEmail, validatePassword, getEmailError, getPasswordError };
};

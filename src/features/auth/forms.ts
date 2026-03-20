import { z } from 'zod';

export const loginFormSchema = z.object({
  usernameOrEmail: z.string().trim().min(1, 'Enter your username or email.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const registerFormSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Username must be at least 3 characters.')
    .max(32, 'Username must be 32 characters or fewer.'),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const forgotPasswordFormSchema = z.object({
  email: z.email('Enter a valid email address.'),
});

export const resendVerificationEmailFormSchema = z.object({
  email: z.email('Enter a valid email address.'),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;
export type ResendVerificationEmailFormValues = z.infer<
  typeof resendVerificationEmailFormSchema
>;

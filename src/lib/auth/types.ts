import { z } from 'zod';

export interface ActionResponse<T> {
  fieldError?: Partial<Record<keyof T, string | undefined>>;
  formError?: string;
}

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Please provide your password.').max(255),
});
export type SignupInput = z.infer<typeof signupSchema>;
export type SignupActionState = Promise<ActionResponse<SignupInput>>;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(8, 'Password is too short. Minimum 8 characters required.').max(255),
});
export type LoginInput = z.infer<typeof loginSchema>;
export type LoginActionState = Promise<ActionResponse<LoginInput>>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ForgotPasswordActionState = Promise<ActionResponse<ForgotPasswordInput>>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Invalid token'),
  password: z.string().min(8, 'Password is too short').max(255),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordActionState = Promise<ActionResponse<ResetPasswordInput>>;

export const VerifyEmailInput = z.object({
  token: z.string().min(6, 'Invalid token'),
});
export type VerifyEmailInput = z.infer<typeof VerifyEmailInput>;
export type VerifyEmailActionState = Promise<ActionResponse<VerifyEmailInput>>;

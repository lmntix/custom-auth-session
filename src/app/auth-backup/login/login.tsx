'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { APP_TITLE } from '@/lib/constants';
import { login } from '@/lib/auth/actions';
import { Label } from '@/components/ui/label';
import { SubmitButton } from '@/components/ui/submit-button';

type LoginState = {
  fieldError?: Record<string, string>;
  formError?: string;
} | null;

export function Login() {
  const [state, submitAction, isPending] = useActionState<LoginState, FormData>(async (prevState, formData) => {
    const result = await login(prevState, formData);
    return result;
  }, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{APP_TITLE} Log In</CardTitle>
        <CardDescription>Log in to your account to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={submitAction} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input required id="email" placeholder="email@example.com" autoComplete="email" name="email" type="email" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="********"
            />
          </div>

          <div className="flex flex-wrap justify-between">
            <Button variant={'link'} size={'sm'} className="p-0" asChild>
              <Link href={'/signup'}>Not signed up? Sign up now.</Link>
            </Button>
            <Button variant={'link'} size={'sm'} className="p-0" asChild>
              <Link href={'/reset-password'}>Forgot password?</Link>
            </Button>
          </div>

          {state?.fieldError ? (
            <ul className="list-disc space-y-1 rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {Object.values(state.fieldError).map(err => (
                <li className="ml-4" key={err}>
                  {err}
                </li>
              ))}
            </ul>
          ) : state?.formError ? (
            <p className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {state?.formError}
            </p>
          ) : null}
          <SubmitButton className="w-full" aria-label="submit-btn" disabled={isPending}>
            {isPending ? 'Logging In...' : 'Log In'}
          </SubmitButton>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

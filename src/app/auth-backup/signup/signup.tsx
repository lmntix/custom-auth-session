'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { APP_TITLE } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { signup } from '@/lib/auth/actions';
import { SubmitButton } from '@/components/ui/submit-button';

type SignupState = {
  fieldError?: Record<string, string>;
  formError?: string;
} | null;

export function Signup() {
  const [state, submitAction, isPending] = useActionState<SignupState, FormData>(signup, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{APP_TITLE} Sign Up</CardTitle>
        <CardDescription>Sign up to start using the app</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="my-2 flex items-center">
          <div className="flex-grow border-t border-muted" />
          <div className="mx-2 text-muted-foreground">or</div>
          <div className="flex-grow border-t border-muted" />
        </div>

        <form action={submitAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" required placeholder="email@example.com" autoComplete="email" name="email" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput id="password" name="password" required autoComplete="new-password" placeholder="********" />
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
          <div>
            <Link href={'/login'}>
              <span className="p-0 text-xs font-medium underline-offset-4 hover:underline">
                Already signed up? Login instead.
              </span>
            </Link>
          </div>

          <Button className="w-full" aria-label="submit-btn" disabled={isPending}>
            {isPending ? 'Signing Up...' : 'Sign Up'}
          </Button>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

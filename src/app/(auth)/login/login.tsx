'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordInput } from '@/components/ui/password-input';
import { APP_TITLE } from '@/lib/constants';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import { login } from '@/lib/auth/actions/login';

export function Login() {
  const {
    execute,
    isExecuting: isPending,
    result,
  } = useAction(login, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
      }
      if (data?.success === false) {
        toast.error(data.message);
      }
    },
    onError: () => {
      toast.error('An error occurred');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    execute({ email, password });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{APP_TITLE} Log In</CardTitle>
        <CardDescription>Log in to your account to access your dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              required
              id="email"
              placeholder="email@example.com"
              autoComplete="email"
              name="email"
              type="email"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="********"
              disabled={isPending}
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

          {result?.validationErrors && (
            <div className="rounded-lg border bg-destructive/10 p-2 text-[0.8rem] font-medium text-destructive">
              {Object.values(result.validationErrors).map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          <Button type="submit" className="w-full" aria-label="submit-btn" disabled={isPending}>
            {isPending ? 'Logging In...' : 'Log In'}
          </Button>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

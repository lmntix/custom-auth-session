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
import { testaction } from './testaction';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { TriangleAlertIcon } from 'lucide-react';

export function Test() {
  const [state, submitAction, isPending] = useActionState(testaction, null);

  useEffect(() => {
    if (state?.error) {
      toast(state.error, {
        icon: <TriangleAlertIcon className="h-5 w-5 text-destructive" />,
      });
    } else if (state?.success) {
      toast('Action completed successfully!');
    }
  }, [state]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{APP_TITLE} Test</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={submitAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="text" required name="text" type="text" />
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

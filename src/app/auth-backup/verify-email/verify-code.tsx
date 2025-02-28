'use client';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import { useEffect, useRef } from 'react';
import { useActionState } from 'react';
import { toast } from 'sonner';
import { logout, verifyEmail, resendVerificationEmail as resendEmail } from '@/lib/auth/actions';
import { SubmitButton } from '@/components/ui/submit-button';
import { TriangleAlertIcon } from 'lucide-react';

type ActionState = {
  error?: string;
} | null;

export const VerifyCode = () => {
  const [verifyEmailState, verifyEmailAction, isVerifyPending] = useActionState(verifyEmail, null);
  const [resendState, resendAction, isResendPending] = useActionState(resendEmail, null);

  const codeFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resendState === null) {
      toast('Email sent!');
    } else if (resendState.error) {
      toast(resendState.error, {
        icon: <TriangleAlertIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [resendState]);

  useEffect(() => {
    if (verifyEmailState?.error) {
      toast(verifyEmailState.error, {
        icon: <TriangleAlertIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [verifyEmailState?.error]);

  const handleLogout = async (formData: FormData) => {
    const result = await logout();
    if (result && 'error' in result) {
      toast(result.error, {
        icon: <TriangleAlertIcon className="h-5 w-5 text-destructive" />,
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <form ref={codeFormRef} action={verifyEmailAction}>
        <Label htmlFor="code">Verification Code</Label>
        <Input className="mt-2" type="text" id="code" name="code" required />
        <SubmitButton className="mt-4 w-full" aria-label="submit-btn" disabled={isVerifyPending}>
          {isVerifyPending ? 'Verifying...' : 'Verify'}
        </SubmitButton>
      </form>
      <form action={resendAction}>
        <SubmitButton className="w-full" variant="secondary" disabled={isResendPending}>
          {isResendPending ? 'Sending...' : 'Resend Code'}
        </SubmitButton>
      </form>
      <form action={handleLogout}>
        <SubmitButton variant="link" className="p-0 font-normal">
          want to use another email? Log out now.
        </SubmitButton>
      </form>
    </div>
  );
};

'use client';
import { toast } from 'sonner';
import { logout } from '@/lib/auth/actions';
import { TriangleAlertIcon } from 'lucide-react';
import { SubmitButton } from './ui/submit-button';

export const LogoutButton = () => {
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
      <form action={handleLogout}>
        <SubmitButton variant="outline" className="p-0 font-normal">
          Logout
        </SubmitButton>
      </form>
    </div>
  );
};

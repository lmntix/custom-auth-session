'use client';

import { forwardRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { ButtonProps } from '@/components/ui/button';

const SubmitButton = forwardRef<HTMLButtonElement, ButtonProps>(({ className, children, ...props }, ref) => {
  const { pending } = useFormStatus();

  return (
    <Button ref={ref} {...props} disabled={pending} className={className}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
});

SubmitButton.displayName = 'SubmitButton';

export { SubmitButton };

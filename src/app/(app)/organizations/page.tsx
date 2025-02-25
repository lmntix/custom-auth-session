import { LogoutButton } from '@/components/logout-button';
import { auth } from '@/lib/auth';
import { Paths } from '@/lib/constants';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { user } = await auth.validateRequest();

  if (!user) redirect(Paths.Login);

  return (
    <div>
      <h1>Organizations</h1>
      <LogoutButton />
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}

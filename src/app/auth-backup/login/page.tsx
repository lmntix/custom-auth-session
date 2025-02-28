import { redirect } from 'next/navigation';
import { Paths } from '@/lib/constants';
import { Login } from './login';
import { auth } from '@/lib/auth';

export const metadata = {
  title: 'Login',
  description: 'Login Page',
};

export default async function LoginPage() {
  const { user } = await auth.validateRequest();

  if (user) redirect(Paths.LoggedInRedirect);

  return <Login />;
}

import { redirect } from 'next/navigation';
import { validateRequest } from '@/lib/auth';
import { Paths } from '@/lib/constants';
import Link from 'next/link';
import { getSession } from '@/lib/auth/session';

export default async function SignupPage() {
  // const { user } = await validateRequest();

  const { user } = await getSession();
  console.log('session : ', user);

  if (!user) redirect(Paths.Login);
  const uuid = crypto.randomUUID();

  return (
    <div>
      <Link href={`/organizations/${uuid}`}>
        <button className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600">Go to Test {uuid}</button>
      </Link>
    </div>
  );
}

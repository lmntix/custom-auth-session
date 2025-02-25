import { redirect } from 'next/navigation';
import { validateRequest } from '@/lib/auth';
import { Paths } from '@/lib/constants';
import { Test } from './test';
import Link from 'next/link';

export default async function SignupPage() {
  const { user } = await validateRequest();

  if (!user) redirect(Paths.LoggedInRedirect);
  const uuid = crypto.randomUUID();

  return (
    <div>
      <Test />

      <Link href={`/test/${uuid}`}>
        <button className="px-4 py-2 mt-4 text-white bg-blue-500 rounded hover:bg-blue-600">Go to Test {uuid}</button>
      </Link>
    </div>
  );
}

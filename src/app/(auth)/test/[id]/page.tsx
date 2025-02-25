import { LogoutButton } from '@/components/logout-button';
import { getSession } from '@/lib/auth/session';

export default async function TestPage() {
  const session = await getSession();

  return (
    <div className="p-4">
      <pre className=" p-4 rounded-lg overflow-auto">
        <code>{JSON.stringify(session, null, 2)}</code>
      </pre>
      <LogoutButton />
    </div>
  );
}

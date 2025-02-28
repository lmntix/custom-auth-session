import { LogoutButton } from '@/components/logout-button';
import { validateRequest } from '@/lib/auth';

export default async function OrganizationPage() {
  const session = await validateRequest();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Organization Page</h1>

      <div className="mb-6  p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Session Info</h2>
        <pre className=" p-4 rounded-lg overflow-auto">
          <code>{JSON.stringify(session.session, null, 2)}</code>
        </pre>
      </div>

      <LogoutButton />
    </div>
  );
}

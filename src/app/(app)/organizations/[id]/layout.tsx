import '@/app/globals.css';
import { eq } from 'drizzle-orm';
import db from '@/db';
import { sessions } from '@/db/schema/auth';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { validateRequest } from '@/lib/auth';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const session = await validateRequest();
  const { id: currentid } = await params;

  if (!session.session) {
    return redirect('/login');
  }

  await db
    .update(sessions)
    .set({ activeOrganizationId: currentid })
    .where(eq(sessions.id, session.session?.id))
    .execute();

  return (
    <div>
      <div className="p-4 mb-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Current Session Info</h2>
        <p>Active Organization ID: {session.session?.activeOrganizationId}</p>
      </div>
      {children}
    </div>
  );
}

import '@/app/globals.css';
import { eq } from 'drizzle-orm';
import db from '@/db';
import { sessions } from '@/db/schema/auth';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}>) {
  const session = await getSession();
  const { id: currentid } = await params;
  console.log('current id : ', currentid);

  if (!session.session) {
    return redirect('/login');
  }

  await db
    .update(sessions)
    .set({ activeOrganizationId: currentid })
    .where(eq(sessions.id, session.session?.id))
    .execute();

  return <div>{children}</div>;
}

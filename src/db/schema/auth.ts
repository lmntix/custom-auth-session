import { relations, sql } from 'drizzle-orm';
import { boolean, index, pgEnum, pgSchema, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const appRoleEnum = pgEnum('app_role', ['user', 'admin']);
export const authSchema = pgSchema('auth');

// Common timestamp fields for all tables
export const timestamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
} as const;

export const users = authSchema.table('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  hashedPassword: text('hashed_password'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  role: appRoleEnum('role').notNull().default('user'),
  banned: boolean('banned'),
  banReason: text('ban_reason'),
  banExpires: timestamp('ban_expires'),
  ...timestamps,
});

export const sessions = authSchema.table('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
  activeOrganizationId: uuid('active_organization_id'),
  impersonatedBy: uuid('impersonated_by'),
  ...timestamps,
});

export const emailVerificationCodes = authSchema.table(
  'email_verification_codes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').unique().notNull(),
    email: text('email').notNull(),
    code: text('code').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ...timestamps,
  },
  t => [
    {
      userIdx: index('verification_code_user_idx').on(t.userId),
      emailIdx: index('verification_code_email_idx').on(t.email),
    },
  ]
);

export const passwordResetTokens = authSchema.table(
  'password_reset_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    ...timestamps,
  },
  t => [
    {
      userIdx: index('password_token_user_idx').on(t.userId),
    },
  ]
);

export const organizations = authSchema.table('organizations', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  logo: text('logo'),
  ...timestamps,
});

export const orgMembers = authSchema.table('org_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, {
      onUpdate: 'cascade',
      onDelete: 'cascade',
    }),
  role: text('role').notNull(),
  ...timestamps,
});

export const invitations = authSchema.table('invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  organizationId: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
  email: text('email').notNull(),
  role: text('role'),
  status: text('status').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  inviterId: uuid('inviter_id')
    .notNull()
    .references(() => users.id),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;

export type UserOrganization = typeof orgMembers.$inferSelect;
export type NewUserOrganization = typeof orgMembers.$inferInsert;

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type NewEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;

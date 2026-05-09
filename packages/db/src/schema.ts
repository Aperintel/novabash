/**
 * NovaBash Phase A schema. Lives inside Supabase Postgres. RLS lives in
 * accompanying SQL policies (drizzle-kit cannot generate these, so they live
 * alongside as 0001_policies.sql).
 *
 * Tables:
 *   user_profile         per-user metadata captured at onboarding
 *   workspaces           one per team or solo developer
 *   workspace_members    join table for team workspaces (Phase A: solo only)
 *   environments         development / staging / production per workspace
 *   credentials          encrypted vendor credentials, scoped to environment
 *   service_keys         workspace key tokens (hashed for lookup)
 *   audit_log            hash-chained record of every credential read/write
 *   waitlist             pre-launch email captures
 *   bundles_published    community-published stack bundles
 */

import {
  pgTable,
  uuid,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  jsonb,
  index,
  primaryKey,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const projectTypeEnum = pgEnum('project_type', [
  'saas',
  'ai',
  'mobile',
  'data',
  'edge',
  'side',
]);

export const experienceEnum = pgEnum('experience_level', ['first', 'comfortable', 'expert']);

export const environmentNameEnum = pgEnum('environment_name', [
  'development',
  'staging',
  'production',
]);

export const userProfile = pgTable('user_profile', {
  userId: uuid('user_id').primaryKey(), // FK -> auth.users(id) via RLS
  projectType: projectTypeEnum('project_type'),
  experience: experienceEnum('experience'),
  defaultBundle: varchar('default_bundle', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workspaces = pgTable(
  'workspaces',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull(),
    name: varchar('name', { length: 80 }).notNull(),
    slug: varchar('slug', { length: 80 }).notNull().unique(),
    bundleId: varchar('bundle_id', { length: 64 }).notNull(),
    region: varchar('region', { length: 32 }).notNull().default('eu-west-2'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    ownerIdx: index('workspaces_owner_idx').on(t.ownerId),
  }),
);

export const workspaceMembers = pgTable(
  'workspace_members',
  {
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(),
    role: varchar('role', { length: 16 }).notNull().default('owner'),
    addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.workspaceId, t.userId] }),
  }),
);

export const environments = pgTable(
  'environments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: environmentNameEnum('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index('environments_workspace_idx').on(t.workspaceId),
  }),
);

export const credentials = pgTable(
  'credentials',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    environmentId: uuid('environment_id')
      .notNull()
      .references(() => environments.id, { onDelete: 'cascade' }),
    serviceId: varchar('service_id', { length: 64 }).notNull(),
    fieldId: varchar('field_id', { length: 64 }).notNull(),
    envName: varchar('env_name', { length: 128 }).notNull(),
    // pgcrypto envelope-encrypted blob. The data key is itself encrypted by the
    // master key, which lives in env vars in MVP and AWS KMS at v1.0.
    cipher: text('cipher').notNull(),
    dataKeyCipher: text('data_key_cipher').notNull(),
    keyVersion: integer('key_version').notNull().default(1),
    lastValidatedAt: timestamp('last_validated_at', { withTimezone: true }),
    rotationDueAt: timestamp('rotation_due_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    envIdx: index('credentials_env_idx').on(t.environmentId),
    serviceIdx: index('credentials_service_idx').on(t.serviceId),
  }),
);

export const serviceKeys = pgTable(
  'service_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    // sha256 of the workspace-key plaintext, used for lookup. Plaintext is
    // returned to the user once on creation and never stored.
    tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
    label: varchar('label', { length: 80 }).notNull(),
    scope: varchar('scope', { length: 16 }).notNull().default('full'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
  },
  (t) => ({
    workspaceIdx: index('service_keys_workspace_idx').on(t.workspaceId),
  }),
);

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    actorUserId: uuid('actor_user_id'),
    actorTokenId: uuid('actor_token_id'),
    action: varchar('action', { length: 64 }).notNull(),
    target: varchar('target', { length: 128 }).notNull(),
    payload: jsonb('payload'),
    // Hash chain: sha256( previous_hash || canonical_json(this_event) )
    prevHash: varchar('prev_hash', { length: 64 }),
    hash: varchar('hash', { length: 64 }).notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    workspaceIdx: index('audit_log_workspace_idx').on(t.workspaceId),
    occurredIdx: index('audit_log_occurred_idx').on(t.occurredAt),
  }),
);

export const waitlist = pgTable(
  'waitlist',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 254 }).notNull().unique(),
    source: varchar('source', { length: 32 }).notNull().default('holding-page'),
    referrer: varchar('referrer', { length: 254 }),
    confirmed: boolean('confirmed').notNull().default(false),
    invitedAt: timestamp('invited_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    sourceIdx: index('waitlist_source_idx').on(t.source),
  }),
);

export const bundlesPublished = pgTable(
  'bundles_published',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorUserId: uuid('author_user_id').notNull(),
    parentBundleId: uuid('parent_bundle_id'),
    name: varchar('name', { length: 80 }).notNull(),
    slug: varchar('slug', { length: 80 }).notNull().unique(),
    description: text('description').notNull(),
    services: jsonb('services').notNull(),
    tags: jsonb('tags').notNull().default('[]'),
    isPublic: boolean('is_public').notNull().default(false),
    forkCount: integer('fork_count').notNull().default(0),
    starCount: integer('star_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    authorIdx: index('bundles_published_author_idx').on(t.authorUserId),
    publicIdx: index('bundles_published_public_idx').on(t.isPublic),
  }),
);

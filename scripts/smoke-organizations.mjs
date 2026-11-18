// Access checks for organizations and membership, run as an ordinary volunteer
// and as an anonymous visitor through the public API, exactly as any client
// (web or native) would call it. LOCAL stack only.
//
//   npm run test:access
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { clientOptions, getLocalSupabaseConfig } from "./lib/local-supabase.mjs";

const { url, anonKey, serviceKey } = getLocalSupabaseConfig();
const admin = createClient(url, serviceKey, clientOptions);
const anon = createClient(url, anonKey, clientOptions);
const volunteer = createClient(url, anonKey, clientOptions);
const coordinator = createClient(url, anonKey, clientOptions);

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = `Access-${crypto.randomUUID()}!`;
const createdUsers = [];
const createdOrgs = [];
const results = [];

async function check(name, fn) {
  await fn();
  results.push(name);
}

async function createOrg(status) {
  const { data, error } = await admin
    .from("organizations")
    .insert({ slug: `access-test-${status}-${suffix}`, name: `Access test ${status} ${suffix}`, summary: "Temporary", category: "Другое", status })
    .select("id")
    .single();
  assert.ifError(error);
  createdOrgs.push(data.id);
  return data.id;
}

try {
  const activeOrg = await createOrg("active");
  const hiddenOrg = await createOrg("hidden");

  // A volunteer created through the admin API who asks for the coordinator role.
  const { data: volunteerUser, error: volunteerError } = await admin.auth.admin.createUser({
    email: `access-volunteer-${suffix}@example.test`,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Access Volunteer", role: "coordinator" },
  });
  assert.ifError(volunteerError);
  const volunteerId = volunteerUser.user.id;
  createdUsers.push(volunteerId);

  const { data: coordinatorUser, error: coordinatorError } = await admin.auth.admin.createUser({
    email: `access-coordinator-${suffix}@example.test`,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Access Coordinator" },
  });
  assert.ifError(coordinatorError);
  const coordinatorId = coordinatorUser.user.id;
  createdUsers.push(coordinatorId);
  assert.ifError((await admin.from("organization_members").insert({ organization_id: activeOrg, user_id: coordinatorId, role: "coordinator" })).error);

  assert.ifError((await volunteer.auth.signInWithPassword({ email: `access-volunteer-${suffix}@example.test`, password })).error);
  assert.ifError((await coordinator.auth.signInWithPassword({ email: `access-coordinator-${suffix}@example.test`, password })).error);

  await check("sign-up metadata role=coordinator still creates a volunteer (admin API)", async () => {
    const { data } = await admin.from("profiles").select("role").eq("id", volunteerId).single();
    assert.equal(data.role, "volunteer");
  });

  await check("public sign-up with role=coordinator in metadata creates a volunteer", async () => {
    const email = `access-signup-${suffix}@example.test`;
    const { data, error } = await anon.auth.signUp({ email, password, options: { data: { full_name: "Access Signup", role: "coordinator" } } });
    assert.ifError(error);
    createdUsers.push(data.user.id);
    const { data: profile } = await admin.from("profiles").select("role").eq("id", data.user.id).single();
    assert.equal(profile.role, "volunteer");
  });

  await check("anon reads active organizations but not hidden ones", async () => {
    const { data, error } = await anon.from("organizations").select("id").in("id", [activeOrg, hiddenOrg]);
    assert.ifError(error);
    assert.deepEqual(data.map((row) => row.id), [activeOrg]);
  });

  await check("anon cannot read memberships or call join_organization", async () => {
    const { data } = await anon.from("organization_members").select("user_id").limit(1);
    assert.equal(data?.length ?? 0, 0);
    const { error } = await anon.rpc("join_organization", { target: activeOrg });
    assert(error, "anon must not execute join_organization");
  });

  await check("volunteer cannot create or edit organizations", async () => {
    const { error: insertError } = await volunteer.from("organizations").insert({ slug: `access-forbidden-${suffix}`, name: "Forbidden org" });
    assert(insertError, "insert into organizations must fail");
    const { data: updated } = await volunteer.from("organizations").update({ name: "Renamed" }).eq("id", activeOrg).select("id");
    assert.equal(updated?.length ?? 0, 0);
  });

  await check("volunteer cannot insert into organization_members directly", async () => {
    const { error } = await volunteer.from("organization_members").insert({ organization_id: activeOrg, user_id: volunteerId, role: "volunteer" });
    assert(error, "direct membership insert must fail");
    const { data } = await admin.from("organization_members").select("role").eq("organization_id", activeOrg).eq("user_id", volunteerId);
    assert.equal(data.length, 0);
  });

  await check("volunteer cannot join a hidden organization", async () => {
    const { error } = await volunteer.rpc("join_organization", { target: hiddenOrg });
    assert(error, "joining a hidden organization must fail");
    const { data } = await admin.from("organization_members").select("role").eq("organization_id", hiddenOrg).eq("user_id", volunteerId);
    assert.equal(data.length, 0);
  });

  await check("volunteer joins an active organization as volunteer, twice without error", async () => {
    const first = await volunteer.rpc("join_organization", { target: activeOrg });
    assert.ifError(first.error);
    assert.equal(first.data.role, "volunteer");
    const second = await volunteer.rpc("join_organization", { target: activeOrg });
    assert.ifError(second.error);
    const { data } = await volunteer.from("organization_members").select("organization_id, role").eq("user_id", volunteerId);
    assert.deepEqual(data, [{ organization_id: activeOrg, role: "volunteer" }]);
  });

  await check("volunteer cannot change their own membership role", async () => {
    const { data: updated } = await volunteer.from("organization_members").update({ role: "head" }).eq("organization_id", activeOrg).eq("user_id", volunteerId).select("role");
    assert.equal(updated?.length ?? 0, 0);
    const { data } = await admin.from("organization_members").select("role").eq("organization_id", activeOrg).eq("user_id", volunteerId).single();
    assert.equal(data.role, "volunteer");
  });

  await check("volunteer cannot read other members of the organization", async () => {
    const { data } = await volunteer.from("organization_members").select("user_id").eq("organization_id", activeOrg);
    assert.deepEqual(data.map((row) => row.user_id), [volunteerId]);
  });

  await check("volunteer cannot set profiles.onboarded_at or role directly", async () => {
    const { error: onboardError } = await volunteer.from("profiles").update({ onboarded_at: new Date().toISOString() }).eq("id", volunteerId);
    assert(onboardError, "direct onboarded_at update must fail");
    const { error: roleError } = await volunteer.from("profiles").update({ role: "coordinator" }).eq("id", volunteerId);
    assert(roleError, "direct role update must fail");
    const { data } = await admin.from("profiles").select("onboarded_at, role").eq("id", volunteerId).single();
    assert.equal(data.onboarded_at, null);
    assert.equal(data.role, "volunteer");
  });

  await check("complete_onboarding sets onboarded_at once", async () => {
    const first = await volunteer.rpc("complete_onboarding");
    assert.ifError(first.error);
    assert(first.data, "complete_onboarding must return the timestamp");
    const second = await volunteer.rpc("complete_onboarding");
    assert.ifError(second.error);
    assert.equal(new Date(second.data).getTime(), new Date(first.data).getTime());
  });

  await check("volunteer leaves an organization", async () => {
    assert.ifError((await volunteer.rpc("leave_organization", { target: activeOrg })).error);
    const { data } = await admin.from("organization_members").select("role").eq("organization_id", activeOrg).eq("user_id", volunteerId);
    assert.equal(data.length, 0);
  });

  await check("coordinator cannot leave through leave_organization", async () => {
    const { error } = await coordinator.rpc("leave_organization", { target: activeOrg });
    assert(error, "coordinator leave must fail");
    assert.equal(error.code, "42501");
    const { data } = await admin.from("organization_members").select("role").eq("organization_id", activeOrg).eq("user_id", coordinatorId).single();
    assert.equal(data.role, "coordinator");
  });

  for (const name of results) console.log(`  ok  ${name}`);
  console.log(`Organization access checks passed (${results.length}).`);
} finally {
  for (const id of createdUsers) await admin.auth.admin.deleteUser(id);
  if (createdOrgs.length) await admin.from("organizations").delete().in("id", createdOrgs);
}

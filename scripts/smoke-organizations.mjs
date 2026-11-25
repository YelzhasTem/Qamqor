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

  // Applications, check-in codes, apply_to_project, leave_organization, feed.

  // The coordinator account becomes a coordinator profile for the checks below
  // (approving applications and "not a volunteer").
  assert.ifError((await admin.from("profiles").update({ role: "coordinator" }).eq("id", coordinatorId)).error);

  const extraVolunteer = async (label) => {
    const email = `access-${label}-${suffix}@example.test`;
    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: `Access ${label}` } });
    assert.ifError(error);
    createdUsers.push(data.user.id);
    const client = createClient(url, anonKey, clientOptions);
    assert.ifError((await client.auth.signInWithPassword({ email, password })).error);
    return { id: data.user.id, client };
  };
  const member = await extraVolunteer("member");
  const outsider = await extraVolunteer("outsider");
  const leaver = await extraVolunteer("leaver");
  const filler = await extraVolunteer("filler");
  for (const person of [member, leaver, filler]) {
    assert.ifError((await person.client.rpc("join_organization", { target: activeOrg })).error);
  }

  const createProject = async (label, { org = activeOrg, capacity = 5, startsInHours = 24, hoursLong = 3 } = {}) => {
    const start = Date.now() + startsInHours * 3_600_000;
    const { data, error } = await admin.from("projects").insert({
      coordinator_id: coordinatorId,
      organization_id: org,
      title: `Access ${label} ${suffix}`.slice(0, 160),
      description: "Temporary project for the organization access checks.",
      category: "Другое",
      city: "Алматы",
      address: "Test address",
      start_date: new Date(start).toISOString(),
      end_date: new Date(start + hoursLong * 3_600_000).toISOString(),
      volunteer_hours: 2,
      benefits: ["volunteer_hours"],
      required_volunteers: capacity,
      status: "published",
    }).select("id").single();
    assert.ifError(error);
    return data.id;
  };
  const moveToPast = async (projectId) => {
    const start = Date.now() - 3 * 86_400_000;
    assert.ifError((await admin.from("projects").update({ start_date: new Date(start).toISOString(), end_date: new Date(start + 3_600_000).toISOString() }).eq("id", projectId)).error);
  };
  const approve = async (applicationId, status = "approved") => {
    const { error } = await coordinator.from("project_applications").update({ status }).eq("id", applicationId);
    assert.ifError(error);
    const { data } = await admin.from("project_applications").select("status, checkin_code").eq("id", applicationId).single();
    assert.equal(data.status, status);
    return data;
  };

  const openProject = await createProject("open");
  const fullProject = await createProject("full", { capacity: 1 });
  const finishedProject = await createProject("finished");
  const hiddenOrgProject = await createProject("hidden-org", { org: hiddenOrg });
  await moveToPast(finishedProject);

  await check("volunteer cannot create an approved application (always pending, no code)", async () => {
    const { data, error } = await member.client.from("project_applications")
      .insert({ project_id: openProject, volunteer_id: member.id, status: "approved" })
      .select("id, status, checkin_code").single();
    assert.ifError(error);
    assert.equal(data.status, "pending");
    assert.equal(data.checkin_code, null);
    assert.ifError((await member.client.from("project_applications").delete().eq("id", data.id)).error);
  });

  await check("volunteer cannot set a check-in code, on insert or update", async () => {
    const { error: insertError } = await member.client.from("project_applications")
      .insert({ project_id: openProject, volunteer_id: member.id, checkin_code: "chosen-by-the-client-0000000" });
    assert(insertError, "writing checkin_code on insert must fail");
    const { data: application, error } = await member.client.rpc("apply_to_project", { target: openProject });
    assert.ifError(error);
    const { error: updateError } = await member.client.from("project_applications")
      .update({ checkin_code: "chosen-by-the-client-0000000" }).eq("id", application.id);
    assert(updateError, "writing checkin_code on update must fail");
    const { error: statusError, data: statusRows } = await member.client.from("project_applications")
      .update({ status: "approved" }).eq("id", application.id).select("id");
    assert(statusError || (statusRows?.length ?? 0) === 0, "volunteer must not approve their own application");
    const { data } = await admin.from("project_applications").select("status, checkin_code").eq("id", application.id).single();
    assert.deepEqual(data, { status: "pending", checkin_code: null });
  });

  await check("non-member cannot insert an application directly", async () => {
    const { error } = await outsider.client.from("project_applications").insert({ project_id: openProject, volunteer_id: outsider.id });
    assert(error, "direct insert by a non-member must fail");
    assert.equal(error.message, "not_a_member");
  });

  let outsiderApplication;
  await check("apply_to_project joins the organization and creates a pending application", async () => {
    const { data, error } = await outsider.client.rpc("apply_to_project", { target: openProject });
    assert.ifError(error);
    assert.equal(data.status, "pending");
    assert.equal(data.checkin_code, null);
    outsiderApplication = data;
    const { data: membership } = await admin.from("organization_members").select("role").eq("organization_id", activeOrg).eq("user_id", outsider.id).single();
    assert.equal(membership.role, "volunteer");
  });

  await check("apply_to_project refuses a second application", async () => {
    const { error } = await outsider.client.rpc("apply_to_project", { target: openProject });
    assert.equal(error?.message, "already_applied");
    assert.equal(error?.code, "QA411");
  });

  await check("apply_to_project refuses a full project", async () => {
    const { data: taken } = await filler.client.rpc("apply_to_project", { target: fullProject });
    await approve(taken.id);
    const { error } = await member.client.rpc("apply_to_project", { target: fullProject });
    assert.equal(error?.message, "project_full");
  });

  await check("apply_to_project refuses a finished project and a hidden organization", async () => {
    const finished = await member.client.rpc("apply_to_project", { target: finishedProject });
    assert.equal(finished.error?.message, "project_not_open");
    const hidden = await member.client.rpc("apply_to_project", { target: hiddenOrgProject });
    assert.equal(hidden.error?.message, "project_not_open");
    const { data } = await admin.from("project_applications").select("id").eq("volunteer_id", member.id).in("project_id", [finishedProject, hiddenOrgProject]);
    assert.equal(data.length, 0);
  });

  await check("apply_to_project refuses anonymous callers and non-volunteers", async () => {
    const { error: anonError } = await anon.rpc("apply_to_project", { target: openProject });
    assert(anonError, "anon must not execute apply_to_project");
    const { error } = await coordinator.rpc("apply_to_project", { target: openProject });
    assert.equal(error?.message, "not_a_volunteer");
  });

  let approvedCode;
  await check("a check-in code appears on approval, stays when attended, and is cleared on rejection", async () => {
    const approved = await approve(outsiderApplication.id);
    assert.match(approved.checkin_code, /^[A-Za-z0-9_-]{24,}$/);
    approvedCode = approved.checkin_code;
    const attended = await approve(outsiderApplication.id, "attended");
    assert.equal(attended.checkin_code, approvedCode);

    const { data: other } = await member.client.from("project_applications").select("id").eq("project_id", openProject).eq("volunteer_id", member.id).single();
    const second = await approve(other.id);
    assert(second.checkin_code && second.checkin_code !== approvedCode, "codes must be unique per application");
    const rejected = await approve(other.id, "rejected");
    assert.equal(rejected.checkin_code, null);
  });

  await check("a volunteer reads their own code; another volunteer and anon cannot", async () => {
    const own = await outsider.client.from("project_applications").select("checkin_code").eq("id", outsiderApplication.id).single();
    assert.equal(own.data?.checkin_code, approvedCode);
    const foreign = await member.client.from("project_applications").select("checkin_code").eq("id", outsiderApplication.id);
    assert.equal(foreign.data?.length ?? 0, 0);
    const byCode = await member.client.from("project_applications").select("id").eq("checkin_code", approvedCode);
    assert.equal(byCode.data?.length ?? 0, 0);
    const anonymous = await anon.from("project_applications").select("id").eq("id", outsiderApplication.id);
    assert.equal(anonymous.data?.length ?? 0, 0);
    const owner = await coordinator.from("project_applications").select("checkin_code").eq("id", outsiderApplication.id).single();
    assert.equal(owner.data?.checkin_code, approvedCode);
  });

  await check("volunteer_feed returns open projects of active organizations with only the caller's own status", async () => {
    const mine = await outsider.client.rpc("volunteer_feed", { scope: "mine", page_size: 100 });
    assert.ifError(mine.error);
    const ids = mine.data.map((row) => row.project_id);
    assert(ids.includes(openProject) && ids.includes(fullProject));
    assert(!ids.includes(finishedProject), "finished projects are not in the feed");
    assert(!ids.includes(hiddenOrgProject), "hidden organizations are not in the feed");
    const openRow = mine.data.find((row) => row.project_id === openProject);
    assert.equal(openRow.application_status, "attended");
    assert.equal(openRow.organization_name, `Access test active ${suffix}`);
    const fullRow = mine.data.find((row) => row.project_id === fullProject);
    assert.equal(fullRow.available_places, 0);
    assert.equal(fullRow.application_status, null, "another volunteer's application must not show");
    assert(!("checkin_code" in openRow), "the feed never returns check-in codes");

    const all = await leaver.client.rpc("volunteer_feed", { scope: "all", page_size: 100 });
    assert.ifError(all.error);
    assert(all.data.some((row) => row.project_id === openProject));
    assert(all.data.every((row) => row.application_status === null));
    const { error: anonError } = await anon.rpc("volunteer_feed", { scope: "all" });
    assert(anonError, "anon must not execute volunteer_feed");
  });

  await check("leaving an organization cancels upcoming pending and approved applications only", async () => {
    const upcomingPending = await createProject("leave-pending");
    const upcomingApproved = await createProject("leave-approved");
    const pastAttended = await createProject("leave-attended");
    const pastCompleted = await createProject("leave-completed");
    const ids = {};
    for (const [key, projectId] of Object.entries({ upcomingPending, upcomingApproved, pastAttended, pastCompleted })) {
      const { data, error } = await leaver.client.rpc("apply_to_project", { target: projectId });
      assert.ifError(error);
      ids[key] = data.id;
    }
    await approve(ids.upcomingApproved);
    await approve(ids.pastAttended);
    await approve(ids.pastAttended, "attended");
    await approve(ids.pastCompleted);
    await approve(ids.pastCompleted, "completed");
    await moveToPast(pastAttended);
    await moveToPast(pastCompleted);

    const { data: cancelled, error } = await leaver.client.rpc("leave_organization", { target: activeOrg });
    assert.ifError(error);
    assert.equal(cancelled, 2);
    const { data: remaining } = await admin.from("project_applications").select("id, status").eq("volunteer_id", leaver.id);
    assert.deepEqual(remaining.map((row) => row.status).sort(), ["attended", "completed"]);
    const { data: membership } = await admin.from("organization_members").select("role").eq("organization_id", activeOrg).eq("user_id", leaver.id);
    assert.equal(membership.length, 0);
    const again = await leaver.client.rpc("leave_organization", { target: activeOrg });
    assert.ifError(again.error);
    assert.equal(again.data, 0);
  });

  for (const name of results) console.log(`  ok  ${name}`);
  console.log(`Organization access checks passed (${results.length}).`);
} finally {
  for (const id of createdUsers) await admin.auth.admin.deleteUser(id);
  if (createdOrgs.length) {
    await admin.from("projects").delete().in("organization_id", createdOrgs);
    await admin.from("organizations").delete().in("id", createdOrgs);
  }
}

import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
assert(url && anonKey && serviceKey, "Supabase smoke-test environment is incomplete");

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
const admin = createClient(url, serviceKey, options);
const volunteer = createClient(url, anonKey, options);
const coordinator = createClient(url, anonKey, options);
const platformAdmin = createClient(url, anonKey, options);
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const password = `Qamqor-${crypto.randomUUID()}!`;
let volunteerId;
let coordinatorId;
let platformAdminId;

try {
  const { data: volunteerUser, error: volunteerCreateError } = await admin.auth.admin.createUser({ email: `volunteer-${suffix}@example.com`, password, email_confirm: true, user_metadata: { full_name: "Тестовый Волонтёр", city: "Алматы", role: "volunteer" } });
  assert.ifError(volunteerCreateError);
  volunteerId = volunteerUser.user.id;

  const { data: coordinatorUser, error: coordinatorCreateError } = await admin.auth.admin.createUser({ email: `coordinator-${suffix}@example.com`, password, email_confirm: true, user_metadata: { full_name: "Тестовый Координатор", city: "Алматы", role: "coordinator" } });
  assert.ifError(coordinatorCreateError);
  coordinatorId = coordinatorUser.user.id;

  const { data: platformAdminUser, error: platformAdminCreateError } = await admin.auth.admin.createUser({ email: `admin-${suffix}@example.com`, password, email_confirm: true, user_metadata: { full_name: "Тестовый Администратор", city: "Астана" } });
  assert.ifError(platformAdminCreateError);
  platformAdminId = platformAdminUser.user.id;

  const { error: coordinatorRoleError } = await admin.from("profiles").update({ role: "coordinator" }).eq("id", coordinatorId);
  assert.ifError(coordinatorRoleError);
  const { error: adminRoleError } = await admin.from("profiles").update({ role: "admin" }).eq("id", platformAdminId);
  assert.ifError(adminRoleError);

  const { error: volunteerLoginError } = await volunteer.auth.signInWithPassword({ email: `volunteer-${suffix}@example.com`, password });
  const { error: coordinatorLoginError } = await coordinator.auth.signInWithPassword({ email: `coordinator-${suffix}@example.com`, password });
  const { error: platformAdminLoginError } = await platformAdmin.auth.signInWithPassword({ email: `admin-${suffix}@example.com`, password });
  assert.ifError(volunteerLoginError);
  assert.ifError(coordinatorLoginError);
  assert.ifError(platformAdminLoginError);

  const { data: project, error: projectError } = await coordinator.from("projects").insert({ coordinator_id: coordinatorId, title: "Qamqor smoke test project", description: "Временный проект для проверки полного рабочего цикла платформы Qamqor.", category: "Экология", city: "Алматы", address: "Тестовый адрес", format: "offline", start_date: new Date(Date.now() + 86_400_000).toISOString(), end_date: new Date(Date.now() + 172_800_000).toISOString(), volunteer_hours: 6, required_volunteers: 3, benefits: ["volunteer_hours", "meals"], status: "draft" }).select("id").single();
  assert.ifError(projectError);

  const whatsappGroupUrl = "https://chat.whatsapp.com/QamqorSmokeTest123456";
  const { error: whatsappCreateError } = await coordinator.from("project_whatsapp_groups").insert({ project_id: project.id, whatsapp_group_url: whatsappGroupUrl });
  assert.ifError(whatsappCreateError);
  const { error: publishError } = await coordinator.from("projects").update({ status: "published" }).eq("id", project.id);
  assert.ifError(publishError);

  const { data: hiddenWhatsappGroup, error: hiddenWhatsappError } = await volunteer.from("project_whatsapp_groups").select("whatsapp_group_url").eq("project_id", project.id);
  assert.ifError(hiddenWhatsappError);
  assert.equal(hiddenWhatsappGroup?.length, 0, "WhatsApp link must be hidden before application");

  const { data: application, error: applicationError } = await volunteer.from("project_applications").insert({ project_id: project.id, volunteer_id: volunteerId }).select("id,status").single();
  assert.ifError(applicationError);
  assert.equal(application.status, "pending");

  const { data: visibleWhatsappGroup, error: visibleWhatsappError } = await volunteer.from("project_whatsapp_groups").select("whatsapp_group_url").eq("project_id", project.id).single();
  assert.ifError(visibleWhatsappError);
  assert.equal(visibleWhatsappGroup.whatsapp_group_url, whatsappGroupUrl);

  const { error: duplicateError } = await volunteer.from("project_applications").insert({ project_id: project.id, volunteer_id: volunteerId });
  assert(duplicateError, "Duplicate application must be rejected");

  const { data: forbiddenMutation, error: projectMutationError } = await volunteer.from("projects").update({ title: "Forbidden" }).eq("id", project.id).select("id");
  assert.ifError(projectMutationError);
  assert.equal(forbiddenMutation?.length, 0, "Volunteer must not update coordinator projects");

  const { error: approveError } = await coordinator.from("project_applications").update({ status: "approved" }).eq("id", application.id);
  assert.ifError(approveError);
  const { error: attendedError } = await coordinator.from("project_applications").update({ status: "attended" }).eq("id", application.id);
  assert.ifError(attendedError);

  const { error: hoursError } = await coordinator.from("volunteer_hours").insert({ volunteer_id: volunteerId, project_id: project.id, hours: 6, confirmed_by: coordinatorId, status: "confirmed" });
  assert.ifError(hoursError);

  const [{ data: confirmedHours, error: hoursReadError }, { data: certificates, error: certificatesError }, { data: achievements, error: achievementsError }] = await Promise.all([
    volunteer.from("volunteer_hours").select("hours,status").eq("project_id", project.id),
    volunteer.from("certificates").select("id,certificate_url").eq("project_id", project.id),
    volunteer.from("volunteer_achievements").select("achievement_id").eq("volunteer_id", volunteerId),
  ]);
  assert.ifError(hoursReadError);
  assert.ifError(certificatesError);
  assert.ifError(achievementsError);
  assert.equal(confirmedHours?.[0]?.status, "confirmed");
  assert.equal(certificates?.length, 1);
  assert((achievements?.length ?? 0) >= 1, "Confirmed hours should award achievements");

  const { data: blockedPrivateProfile } = await coordinator.from("profiles").select("phone").eq("id", volunteerId).maybeSingle();
  assert.equal(blockedPrivateProfile, null, "Coordinator must not read another private profile row");
  const { data: publicProfile, error: publicProfileError } = await coordinator.from("public_volunteer_profiles").select("id,full_name,confirmed_hours").eq("id", volunteerId).single();
  assert.ifError(publicProfileError);
  assert.equal(publicProfile.id, volunteerId);
  assert.equal(Number(publicProfile.confirmed_hours), 6);

  const { error: forbiddenDeleteError } = await coordinator.rpc("admin_delete_volunteer_user", { target_user_id: volunteerId });
  assert(forbiddenDeleteError, "Coordinator must not delete volunteer accounts");

  const { error: deleteVolunteerError } = await platformAdmin.rpc("admin_delete_volunteer_user", { target_user_id: volunteerId });
  assert.ifError(deleteVolunteerError);
  const { data: deletedVolunteer } = await admin.auth.admin.getUserById(volunteerId);
  assert.equal(deletedVolunteer.user, null, "Administrator deletion must remove the Auth account");
  volunteerId = undefined;

  console.log("Supabase smoke test passed: auth, roles, RLS, project CRUD, private WhatsApp access, application, hours, achievement, certificate and admin-only volunteer deletion.");
} finally {
  if (platformAdminId) await admin.auth.admin.deleteUser(platformAdminId);
  if (coordinatorId) await admin.auth.admin.deleteUser(coordinatorId);
  if (volunteerId) await admin.auth.admin.deleteUser(volunteerId);
}

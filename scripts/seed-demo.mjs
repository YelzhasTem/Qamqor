// Demo data for the LOCAL Supabase stack.
//
//   npm run demo:reset   (db reset + this script)
//
// Creates three demo organizations, a platform admin, a head and a coordinator
// per organization, 40 volunteers, nine projects, applications and hours. Every
// account is created through the Auth admin API, so profiles come from the
// on_auth_user_created trigger exactly as for real sign-ups. Achievements and
// certificates are produced by the existing hours trigger, never inserted here.
//
// All data is invented. The shared demo password is documented in docs/DEMO.md
// and is for the local stack only.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { clientOptions, getLocalSupabaseConfig } from "./lib/local-supabase.mjs";

export const DEMO_DOMAIN = "demo.qamqor.test";
export const DEMO_PASSWORD = "qamqor-demo-local";

const { url, serviceKey } = getLocalSupabaseConfig();
const admin = createClient(url, serviceKey, clientOptions);

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const ALMATY_OFFSET = 5 * HOUR; // Asia/Almaty is UTC+5 all year.

function check(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result.data;
}

let phoneCounter = 0;
function nextPhone() {
  phoneCounter += 1;
  return `+7700000${String(phoneCounter).padStart(4, "0")}`;
}

// Organizations -------------------------------------------------------------

const organizations = [
  {
    key: "help",
    slug: "demo-help",
    name: "Демо · Помощь людям",
    summary: "Демо-организация: продуктовые наборы, помощь пожилым людям и семьям.",
    category: "Социальная помощь",
  },
  {
    key: "eco",
    slug: "demo-eco",
    name: "Демо · Экология",
    summary: "Демо-организация: субботники, посадка деревьев и раздельный сбор.",
    category: "Экология",
  },
  {
    key: "animals",
    slug: "demo-animals",
    name: "Демо · Животные",
    summary: "Демо-организация: помощь приютам, выгул собак и пристройство животных.",
    category: "Животные",
  },
];

// Accounts ------------------------------------------------------------------

const staff = [
  { email: `admin@${DEMO_DOMAIN}`, fullName: "Сауле Демо-Администратор", profileRole: "admin" },
  { email: `head.help@${DEMO_DOMAIN}`, fullName: "Бауыржан Әлиев", profileRole: "coordinator", org: "help", orgRole: "head" },
  { email: `coordinator.help@${DEMO_DOMAIN}`, fullName: "Айжан Токтарова", profileRole: "coordinator", org: "help", orgRole: "coordinator" },
  { email: `head.eco@${DEMO_DOMAIN}`, fullName: "Жанна Мусина", profileRole: "coordinator", org: "eco", orgRole: "head" },
  { email: `coordinator.eco@${DEMO_DOMAIN}`, fullName: "Ринат Хамитов", profileRole: "coordinator", org: "eco", orgRole: "coordinator" },
  { email: `head.animals@${DEMO_DOMAIN}`, fullName: "Серік Байтұрсынов", profileRole: "coordinator", org: "animals", orgRole: "head" },
  { email: `coordinator.animals@${DEMO_DOMAIN}`, fullName: "Лейла Ахмедова", profileRole: "coordinator", org: "animals", orgRole: "coordinator" },
];

const volunteerNames = [
  "Айгерим Сейткали", "Нурлан Абенов", "Дана Жумабекова", "Ерлан Касымов", "Алия Нургалиева",
  "Арман Тулегенов", "Жанар Омарова", "Данияр Бекмуханов", "Мадина Сарсенова", "Тимур Ахметов",
  "Асель Калиева", "Ержан Мухамедиев", "Камила Искакова", "Руслан Жаксылыков", "Айдана Ермекова",
  "Санжар Утепов", "Томирис Бакытжанова", "Алихан Сагинтаев", "Динара Есенова", "Бекзат Нурмаганбетов",
  "Анель Кенжебаева", "Ильяс Байжанов", "Жансая Турсынова", "Мирас Оспанов", "Сабина Ахметжанова",
  "Олжас Иманбаев", "Алина Ким", "Максим Цой", "Екатерина Иванова", "Артём Пак",
  "Аружан Шарипова", "Нуржан Ибраев", "Малика Абдрахманова", "Ақжол Серікбаев", "Әлия Құдайбергенова",
  "Ұлжан Өтегенова", "Ғалым Жүсіпов", "Іңкәр Нұрланқызы", "Дмитрий Ли", "Гүлнұр Сәрсенбаева",
];

const orgKeys = organizations.map((organization) => organization.key);

// Volunteers 1-21: one organization. 22-35: two or three. 36-40: none and not
// onboarded, so they land on the organization picker.
function membershipsFor(index) {
  if (index <= 21) return [orgKeys[(index - 1) % 3]];
  if (index <= 35) {
    if (index % 3 === 0) return [...orgKeys];
    return [orgKeys[index % 3], orgKeys[(index + 1) % 3]];
  }
  return [];
}

const volunteers = volunteerNames.map((fullName, position) => {
  const index = position + 1;
  return {
    email: `volunteer${String(index).padStart(2, "0")}@${DEMO_DOMAIN}`,
    fullName,
    profileRole: "volunteer",
    orgs: membershipsFor(index),
    onboarded: index <= 35,
  };
});

// Cleanup (only matters when demo:seed runs without a reset) ----------------

async function removeExistingDemoData() {
  const existingOrgs = check(await admin.from("organizations").select("id").eq("is_demo", true), "list demo organizations");
  if (existingOrgs.length) {
    const ids = existingOrgs.map((row) => row.id);
    check(await admin.from("projects").delete().in("organization_id", ids), "delete demo projects");
  }

  for (let page = 1; ; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`list users: ${error.message}`);
    const demoUsers = data.users.filter((user) => user.email?.endsWith(`@${DEMO_DOMAIN}`));
    for (const user of demoUsers) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      if (deleteError) throw new Error(`delete ${user.email}: ${deleteError.message}`);
    }
    if (data.users.length < 1000) break;
  }

  if (existingOrgs.length) {
    check(await admin.from("organizations").delete().eq("is_demo", true), "delete demo organizations");
  }
}

// Creation ------------------------------------------------------------------

async function createAccount(account) {
  const { data, error } = await admin.auth.admin.createUser({
    email: account.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: account.fullName, phone: nextPhone() },
  });
  if (error) throw new Error(`create ${account.email}: ${error.message}`);
  return data.user.id;
}

function almatyDayStart(timestamp) {
  const local = timestamp + ALMATY_OFFSET;
  return local - (local % DAY) - ALMATY_OFFSET;
}

function at(dayOffset, hour, now) {
  return new Date(almatyDayStart(now) + dayOffset * DAY + hour * HOUR);
}

async function main() {
  await removeExistingDemoData();

  const orgIds = {};
  for (const organization of organizations) {
    const row = check(
      await admin.from("organizations").insert({
        slug: organization.slug,
        name: organization.name,
        summary: organization.summary,
        category: organization.category,
        is_demo: true,
      }).select("id").single(),
      `create ${organization.slug}`,
    );
    orgIds[organization.key] = row.id;
  }

  const ids = {};
  const now = Date.now();
  const onboardedAt = new Date(now - 30 * DAY).toISOString();

  for (const account of staff) {
    const id = await createAccount(account);
    ids[account.email] = id;
    check(
      await admin.from("profiles").update({ role: account.profileRole, onboarded_at: onboardedAt }).eq("id", id),
      `role for ${account.email}`,
    );
    if (account.org) {
      check(
        await admin.from("organization_members").insert({ organization_id: orgIds[account.org], user_id: id, role: account.orgRole }),
        `membership for ${account.email}`,
      );
    }
  }

  const membersByOrg = { help: [], eco: [], animals: [] };
  for (const account of volunteers) {
    const id = await createAccount(account);
    ids[account.email] = id;
    if (account.onboarded) {
      check(await admin.from("profiles").update({ onboarded_at: onboardedAt }).eq("id", id), `onboard ${account.email}`);
    }
    for (const key of account.orgs) {
      check(
        await admin.from("organization_members").insert({ organization_id: orgIds[key], user_id: id, role: "volunteer" }),
        `membership for ${account.email}`,
      );
      membersByOrg[key].push(id);
    }
  }

  const coordinatorOf = (key) => ids[`coordinator.${key}@${DEMO_DOMAIN}`];

  // Today's project spans the working day, but always stays open for at least
  // another hour so applications can be created whenever the seed runs.
  const todayStart = new Date(Math.min(at(0, 9, now).getTime(), now - HOUR));
  const todayEnd = new Date(Math.max(at(0, 19, now).getTime(), now + 2 * HOUR));

  const projects = [
    {
      key: "help-past", org: "help", kind: "past",
      title: "Сбор продуктовых наборов для пожилых",
      description: "Демонстрационный проект. Собираем и упаковываем продуктовые наборы для пожилых жителей Бостандыкского района, затем развозим их по адресам.",
      address: "ул. Демо-Тимирязева, 1 (вымышленный адрес)", hours: 5, capacity: 10, start: at(-21, 10, now), end: at(-21, 15, now),
      benefits: ["volunteer_hours", "thank_you_letter"],
    },
    {
      key: "help-today", org: "help", kind: "today",
      title: "Ярмарка вещей для семей с детьми",
      description: "Демонстрационный проект. Принимаем и сортируем одежду, помогаем семьям выбрать вещи по размеру, следим за порядком в зале.",
      address: "пр. Демо-Абая, 10 (вымышленный адрес)", hours: 6, capacity: 12, start: todayStart, end: todayEnd,
      benefits: ["volunteer_hours", "meals"],
    },
    {
      key: "help-upcoming", org: "help", kind: "upcoming",
      title: "Чтение книг в доме престарелых",
      description: "Демонстрационный проект. Читаем вслух, играем в настольные игры и просто разговариваем с жителями дома престарелых.",
      address: "мкр. Демо-Орбита, 5 (вымышленный адрес)", hours: 3, capacity: 8, start: at(4, 11, now), end: at(4, 14, now),
      benefits: ["volunteer_hours"],
    },
    {
      key: "eco-past", org: "eco", kind: "past",
      title: "Субботник у Большого Алматинского озера",
      description: "Демонстрационный проект. Собираем мусор вдоль тропы к озеру, сортируем его и вывозим на переработку.",
      address: "Трасса к БАО, парковка (вымышленная точка сбора)", hours: 6, capacity: 8, start: at(-9, 8, now), end: at(-9, 14, now),
      benefits: ["volunteer_hours", "transport"],
    },
    {
      key: "eco-upcoming", org: "eco", kind: "upcoming",
      title: "Посадка деревьев в парке Демо",
      description: "Демонстрационный проект. Высаживаем саженцы клёна и карагача, поливаем и мульчируем лунки. Перчатки и инструмент выдаём.",
      address: "Парк Демо, главный вход (вымышленный адрес)", hours: 4, capacity: 20, start: at(6, 10, now), end: at(6, 14, now),
      benefits: ["volunteer_hours", "merch"],
    },
    {
      key: "eco-full", org: "eco", kind: "full",
      title: "Пункт раздельного сбора на фестивале",
      description: "Демонстрационный проект. Объясняем гостям фестиваля, как сортировать отходы, и следим за контейнерами в течение дня.",
      address: "Площадь Демо, 3 (вымышленный адрес)", hours: 5, capacity: 4, start: at(5, 12, now), end: at(5, 17, now),
      benefits: ["volunteer_hours", "meals"],
    },
    {
      key: "animals-upcoming-1", org: "animals", kind: "upcoming",
      title: "Выгул собак из приюта",
      description: "Демонстрационный проект. Гуляем с собаками из приюта, помогаем им привыкнуть к поводку и людям. Подходит новичкам.",
      address: "Приют «Демо-Друг», ул. Вымышленная, 7", hours: 3, capacity: 10, start: at(3, 10, now), end: at(3, 13, now),
      benefits: ["volunteer_hours"],
    },
    {
      key: "animals-upcoming-2", org: "animals", kind: "upcoming",
      title: "День открытых дверей в приюте",
      description: "Демонстрационный проект. Встречаем гостей, рассказываем о питомцах, которые ищут дом, и помогаем с анкетами пристройства.",
      address: "Приют «Демо-Друг», ул. Вымышленная, 7", hours: 4, capacity: 6, start: at(10, 11, now), end: at(10, 15, now),
      benefits: ["volunteer_hours", "thank_you_letter"],
    },
    {
      key: "animals-draft", org: "animals", kind: "draft",
      title: "Фотосессия для котов из приюта",
      description: "Демонстрационный проект в черновике. Готовим фотографии котов для объявлений о пристройстве.",
      address: "Приют «Демо-Друг», ул. Вымышленная, 7", hours: 2, capacity: 3, start: at(20, 12, now), end: at(20, 14, now),
      benefits: ["volunteer_hours"],
    },
  ];

  const projectIds = {};
  for (const project of projects) {
    const coordinatorId = coordinatorOf(project.org);
    // Past projects are created as running projects first so the existing
    // application trigger accepts their applications, then moved to the past.
    const isPast = project.kind === "past";
    const start = isPast ? new Date(now + DAY) : project.start;
    const end = isPast ? new Date(now + DAY + HOUR) : project.end;
    const row = check(
      await admin.from("projects").insert({
        coordinator_id: coordinatorId,
        organization_id: orgIds[project.org],
        title: project.title,
        description: project.description,
        category: organizations.find((organization) => organization.key === project.org).category,
        city: "Алматы",
        address: project.address,
        format: "offline",
        start_date: start.toISOString(),
        end_date: end.toISOString(),
        volunteer_hours: project.hours,
        required_volunteers: project.capacity,
        benefits: project.benefits,
        status: project.kind === "draft" ? "draft" : "published",
      }).select("id").single(),
      `create project ${project.key}`,
    );
    projectIds[project.key] = row.id;
    check(
      await admin.from("project_whatsapp_groups").insert({
        project_id: row.id,
        whatsapp_group_url: `https://chat.whatsapp.com/DemoQamqor${project.key.replace(/[^a-z0-9]/gi, "")}`,
      }),
      `whatsapp for ${project.key}`,
    );
  }

  // Applications: [project, member index within the org, final status].
  const plan = {
    "help-past": ["completed", "completed", "completed", "completed", "attended", "rejected"],
    "help-today": ["approved", "approved", "approved", "approved", "pending", "pending"],
    "help-upcoming": ["approved", "pending", "pending", "rejected"],
    "eco-past": ["completed", "completed", "completed", "attended", "attended"],
    "eco-upcoming": ["approved", "approved", "pending", "pending", "pending", "rejected"],
    "eco-full": ["approved", "approved", "approved", "approved", "rejected"],
    "animals-upcoming-1": ["approved", "approved", "pending", "pending", "rejected"],
    "animals-upcoming-2": ["approved", "pending", "pending"],
  };

  const applications = [];
  let offset = 0;
  for (const [projectKey, statuses] of Object.entries(plan)) {
    const project = projects.find((item) => item.key === projectKey);
    const members = membersByOrg[project.org];
    statuses.forEach((status, index) => {
      applications.push({ projectKey, volunteerId: members[(offset + index) % members.length], status, hours: project.hours });
    });
    offset += 3;
  }

  for (const application of applications) {
    const row = check(
      await admin.from("project_applications").insert({ project_id: projectIds[application.projectKey], volunteer_id: application.volunteerId }).select("id").single(),
      `apply ${application.projectKey}`,
    );
    application.id = row.id;
  }
  for (const application of applications) {
    if (application.status === "pending") continue;
    check(
      await admin.from("project_applications").update({ status: application.status }).eq("id", application.id),
      `status ${application.projectKey}`,
    );
  }

  // Move past projects to their real dates and mark them completed.
  for (const project of projects.filter((item) => item.kind === "past")) {
    check(
      await admin.from("projects").update({
        start_date: project.start.toISOString(),
        end_date: project.end.toISOString(),
        status: "completed",
      }).eq("id", projectIds[project.key]),
      `complete ${project.key}`,
    );
  }

  // Hours for past projects: completed applications get confirmed hours, the
  // attended ones are still pending, and one claim is rejected. The existing
  // trigger awards achievements and issues certificates for confirmed hours.
  let rejectedOnce = false;
  for (const application of applications) {
    if (!application.projectKey.endsWith("-past")) continue;
    if (application.status !== "completed" && application.status !== "attended") continue;
    const project = projects.find((item) => item.key === application.projectKey);
    let status = application.status === "completed" ? "confirmed" : "pending";
    if (status === "pending" && !rejectedOnce && project.org === "eco") {
      status = "rejected";
      rejectedOnce = true;
    }
    check(
      await admin.from("volunteer_hours").insert({
        volunteer_id: application.volunteerId,
        project_id: projectIds[application.projectKey],
        hours: application.hours,
        confirmed_by: coordinatorOf(project.org),
        status,
      }),
      `hours ${application.projectKey}`,
    );
  }

  // Sanity checks so a silent trigger change shows up here.
  const statuses = check(await admin.from("project_applications").select("status"), "read applications").map((row) => row.status);
  for (const status of ["pending", "approved", "rejected", "attended", "completed"]) {
    assert(statuses.includes(status), `missing application status ${status}`);
  }
  const hourStatuses = check(await admin.from("volunteer_hours").select("status"), "read hours").map((row) => row.status);
  for (const status of ["pending", "confirmed", "rejected"]) {
    assert(hourStatuses.includes(status), `missing hours status ${status}`);
  }
  const certificates = check(await admin.from("certificates").select("id"), "read certificates");
  const awarded = check(await admin.from("volunteer_achievements").select("id"), "read achievements");

  console.log(
    [
      "Demo data ready on the local stack:",
      `  ${organizations.length} organizations, ${staff.length + volunteers.length} accounts (${volunteers.length} volunteers)`,
      `  ${projects.length} projects, ${applications.length} applications, ${hourStatuses.length} hour records`,
      `  ${certificates.length} certificates and ${awarded.length} achievements issued by triggers`,
      "  Accounts and password: docs/DEMO.md",
    ].join("\n"),
  );
}

await main();

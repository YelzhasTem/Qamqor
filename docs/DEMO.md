# Demo accounts (local stack only)

> **Warning.** These accounts and the shared password exist only on your local Supabase stack after `npm run demo:reset`. The password is committed to this repository on purpose and is therefore public. Change it (and every account) before any hosted demo, and never create these accounts on a hosted project.

**Shared password for every demo account:** `qamqor-demo-local`

Every e-mail uses the reserved test domain `demo.qamqor.test`; no message can leave your machine. Phone numbers are fake and start at `+7 700 000 00 01`. All names, organizations, projects and addresses are invented.

## Platform admin

| E-mail | Name |
| --- | --- |
| `admin@demo.qamqor.test` | Сауле Демо-Администратор |

## Organizations, heads and coordinators

Heads and coordinators have `profiles.role = coordinator` so today's coordinator screens work, and the matching role in `organization_members`.

| Organization | Head | Coordinator (owns the projects) |
| --- | --- | --- |
| Демо · Помощь людям | `head.help@demo.qamqor.test` (Бауыржан Әлиев) | `coordinator.help@demo.qamqor.test` (Айжан Токтарова) |
| Демо · Экология | `head.eco@demo.qamqor.test` (Жанна Мусина) | `coordinator.eco@demo.qamqor.test` (Ринат Хамитов) |
| Демо · Животные | `head.animals@demo.qamqor.test` (Серік Байтұрсынов) | `coordinator.animals@demo.qamqor.test` (Лейла Ахмедова) |

## Volunteers

Volunteers 01–21 belong to one organization, 22–35 to two or three, and 36–40 to none. Those last five have not finished onboarding, so signing in sends them to the organization picker.

| E-mail | Name | Organizations |
| --- | --- | --- |
| `volunteer01@demo.qamqor.test` | Айгерим Сейткали | Помощь людям |
| `volunteer02@demo.qamqor.test` | Нурлан Абенов | Экология |
| `volunteer03@demo.qamqor.test` | Дана Жумабекова | Животные |
| `volunteer04@demo.qamqor.test` | Ерлан Касымов | Помощь людям |
| `volunteer05@demo.qamqor.test` | Алия Нургалиева | Экология |
| `volunteer06@demo.qamqor.test` | Арман Тулегенов | Животные |
| `volunteer07@demo.qamqor.test` | Жанар Омарова | Помощь людям |
| `volunteer08@demo.qamqor.test` | Данияр Бекмуханов | Экология |
| `volunteer09@demo.qamqor.test` | Мадина Сарсенова | Животные |
| `volunteer10@demo.qamqor.test` | Тимур Ахметов | Помощь людям |
| `volunteer11@demo.qamqor.test` | Асель Калиева | Экология |
| `volunteer12@demo.qamqor.test` | Ержан Мухамедиев | Животные |
| `volunteer13@demo.qamqor.test` | Камила Искакова | Помощь людям |
| `volunteer14@demo.qamqor.test` | Руслан Жаксылыков | Экология |
| `volunteer15@demo.qamqor.test` | Айдана Ермекова | Животные |
| `volunteer16@demo.qamqor.test` | Санжар Утепов | Помощь людям |
| `volunteer17@demo.qamqor.test` | Томирис Бакытжанова | Экология |
| `volunteer18@demo.qamqor.test` | Алихан Сагинтаев | Животные |
| `volunteer19@demo.qamqor.test` | Динара Есенова | Помощь людям |
| `volunteer20@demo.qamqor.test` | Бекзат Нурмаганбетов | Экология |
| `volunteer21@demo.qamqor.test` | Анель Кенжебаева | Животные |
| `volunteer22@demo.qamqor.test` | Ильяс Байжанов | Экология, Животные |
| `volunteer23@demo.qamqor.test` | Жансая Турсынова | Животные, Помощь людям |
| `volunteer24@demo.qamqor.test` | Мирас Оспанов | Помощь людям, Экология, Животные |
| `volunteer25@demo.qamqor.test` | Сабина Ахметжанова | Экология, Животные |
| `volunteer26@demo.qamqor.test` | Олжас Иманбаев | Животные, Помощь людям |
| `volunteer27@demo.qamqor.test` | Алина Ким | Помощь людям, Экология, Животные |
| `volunteer28@demo.qamqor.test` | Максим Цой | Экология, Животные |
| `volunteer29@demo.qamqor.test` | Екатерина Иванова | Животные, Помощь людям |
| `volunteer30@demo.qamqor.test` | Артём Пак | Помощь людям, Экология, Животные |
| `volunteer31@demo.qamqor.test` | Аружан Шарипова | Экология, Животные |
| `volunteer32@demo.qamqor.test` | Нуржан Ибраев | Животные, Помощь людям |
| `volunteer33@demo.qamqor.test` | Малика Абдрахманова | Помощь людям, Экология, Животные |
| `volunteer34@demo.qamqor.test` | Ақжол Серікбаев | Экология, Животные |
| `volunteer35@demo.qamqor.test` | Әлия Құдайбергенова | Животные, Помощь людям |
| `volunteer36@demo.qamqor.test` | Ұлжан Өтегенова | — (не прошёл выбор организаций) |
| `volunteer37@demo.qamqor.test` | Ғалым Жүсіпов | — (не прошёл выбор организаций) |
| `volunteer38@demo.qamqor.test` | Іңкәр Нұрланқызы | — (не прошёл выбор организаций) |
| `volunteer39@demo.qamqor.test` | Дмитрий Ли | — (не прошёл выбор организаций) |
| `volunteer40@demo.qamqor.test` | Гүлнұр Сәрсенбаева | — (не прошёл выбор организаций) |

## Projects

Dates are computed from the day you run the seed, so the demo never goes stale.

| Organization | Project | State |
| --- | --- | --- |
| Помощь людям | Сбор продуктовых наборов для пожилых | completed, three weeks ago |
| Помощь людям | Ярмарка вещей для семей с детьми | published, happening today |
| Помощь людям | Чтение книг в доме престарелых | published, in 4 days |
| Экология | Субботник у Большого Алматинского озера | completed, 9 days ago |
| Экология | Посадка деревьев в парке Демо | published, in 6 days |
| Экология | Пункт раздельного сбора на фестивале | published, in 5 days, **full** |
| Животные | Выгул собак из приюта | published, in 3 days |
| Животные | День открытых дверей в приюте | published, in 10 days |
| Животные | Фотосессия для котов из приюта | draft |

Applications exist in every status (pending, approved, rejected, attended, completed) and hours in every status (pending, confirmed, rejected). Achievements and certificates are issued by the database triggers from the confirmed hours.

## Trying the volunteer app

Each approved application has its own check-in code; the database creates it on approval and the volunteer sees it as a QR on `/qr`. The QR encodes `http://localhost:3000/checkin/<code>` (`NEXT_PUBLIC_APP_URL` + `/checkin/` + code). The check-in page itself belongs to Part 3.

Good starting points:

| Account | What to look at |
| --- | --- |
| `volunteer10` | Feed with a "today" next-event card, an approved application, its QR, hours and a certificate. |
| `volunteer01` | One organization; apply to «Чтение книг в доме престарелых», then approve as `coordinator.help` and watch `/qr` turn into «Вы отмечены» after «Отметить участие». |
| `volunteer23`, `volunteer24` | Pending applications (cancel them from the project page or `/applications`); `volunteer24` belongs to three organizations, so leaving one in `/profile` shows how many applications it will cancel. |
| `volunteer14` | «Пункт раздельного сбора на фестивале» is full: the bar shows «Мест нет». |
| `volunteer36`–`volunteer40` | No organizations: the organization picker, then an empty «Мои организации» feed; applying to a project joins its organization. |

// Service-role client for the LOCAL Supabase stack only; keys come from `supabase status`.
const { execSync } = require('child_process');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const env = Object.fromEntries(execSync('npx supabase status -o env', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  .trim().split('\n').filter((l) => l.includes('=')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')]; }));
if (!/^http:\/\/(127\.0\.0\.1|localhost)/.test(env.API_URL)) throw new Error('Refusing to run against a non-local Supabase URL');
const { createClient } = require(path.join(root, 'node_modules/@supabase/supabase-js'));
const db = createClient(env.API_URL, env.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function userId(email) { const { data } = await db.auth.admin.listUsers({ perPage: 200 }); return data.users.find((u) => u.email === email)?.id; }
module.exports = { db, userId };

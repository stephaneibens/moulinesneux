import { db } from './src/lib/prisma';
async function test() {
  const u = await db.user.findUnique({ where: { email: 'marie.dupont@email.com' } });
  console.log('User:', u);
  try { console.log('Parsed:', JSON.parse(JSON.stringify(u))); } catch (e) { console.error('Stringify error:', e); }
}
test()

import { db } from './src/lib/prisma';
const u = db.user.findUnique({ email: 'marie.dupont@email.com' });
console.log('User:', u);
try { console.log('Parsed:', JSON.parse(JSON.stringify(u))); } catch (e) { console.error('Stringify error:', e); }

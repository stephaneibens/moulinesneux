import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { db } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'moulin_esneux_secret_2026'

export interface JWTPayload {
  userId: number
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await db.user.findUnique({ where: { id: payload.userId }, include: { appartement: true } })
    return user ? JSON.parse(JSON.stringify(user)) : null
  } catch {
    return null
  }
}

export async function requireAuth(role?: string) {
  const user = await getCurrentUser()
  if (!user) return null
  if (!(user.actif === true)) return null
  if (role && user.role !== role) return null
  return user
}

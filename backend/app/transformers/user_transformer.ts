import type User from '#models/user'

/**
 * Da forma a la representación pública de un usuario.
 * Centraliza la serialización para no exponer campos sensibles
 * y mantener una única fuente de verdad del shape de salida.
 */
export class UserTransformer {
  static toJSON(user: User) {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      lastSeenAt: user.lastSeenAt?.toISO() ?? null,
      createdAt: user.createdAt?.toISO() ?? null,
    }
  }

  static collection(users: User[]) {
    return users.map((user) => UserTransformer.toJSON(user))
  }
}

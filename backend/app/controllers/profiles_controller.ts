import type { HttpContext } from '@adonisjs/core/http'
import { UserTransformer } from '#transformers/user_transformer'

export default class ProfilesController {
  /**
   * GET /account/profile
   * Devuelve el usuario autenticado. Requiere Bearer token.
   */
  async show({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    return response.ok({ user: UserTransformer.toJSON(user) })
  }
}

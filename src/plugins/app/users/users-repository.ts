import { FastifyInstance } from 'fastify'
import { Db, ClientSession, ObjectId } from 'mongodb'
import fp from 'fastify-plugin'
import { Auth } from '../../../schemas/auth.js'

declare module 'fastify' {
  interface FastifyInstance {
    usersRepository: ReturnType<typeof createUsersRepository>;
  }
}

export function createUsersRepository (fastify: FastifyInstance) {
  const db: Db = fastify.mongo.db!

  return {
    async findByEmail (email: string, session?: ClientSession) {
      const user = await db.collection('users')
        .findOne(
          { email },
          { session, projection: { _id: 1, username: 1, password: 1, email: 1 } }
        )

      if (!user) return null

      return {
        id: user._id.toString(),
        username: user.username,
        password: user.password,
        email: user.email
      } as Auth & { password: string }
    },

    async updatePassword (email: string, hashedPassword: string) {
      const result = await db.collection('users')
        .updateOne(
          { email },
          { $set: { password: hashedPassword } }
        )

      return result.modifiedCount
    },

    async findUserRolesByEmail (email: string, session: ClientSession) {
      const user = await db.collection('users')
        .findOne({ email }, { session, projection: { roles: 1 } })

      if (!user || !user.roles) return []

      const roleIds = user.roles.map((id: ObjectId) => new ObjectId(id))

      const roles = await db.collection('roles')
        .find({ _id: { $in: roleIds } }, { session, projection: { name: 1 } })
        .toArray()

      return roles.map(role => ({ name: role.name }))
    }
  }
}

export default fp(
  async function (fastify: FastifyInstance) {
    const repo = createUsersRepository(fastify)
    fastify.decorate('usersRepository', repo)
  },
  {
    name: 'users-repository',
    dependencies: ['mongodb']
  }
)

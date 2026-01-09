import {
  FastifyPluginAsyncTypebox,
  Type
} from '@fastify/type-provider-typebox'

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        response: {
          200: Type.Object({
            message: Type.String(),
            status: Type.String()
          })
        }
      }
    },
    async function () {
      return { message: 'Fastify Demo - v1.0.0', status: 'operational' }
    }
  )
}

export default plugin

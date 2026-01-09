import fp from 'fastify-plugin'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastifySwagger from '@fastify/swagger'

export default fp(async function (fastify) {
  // Disable Swagger in production
  if (process.env.NODE_ENV === 'production') {
    fastify.log.info('Swagger documentation disabled in production')
    return
  }

  fastify.log.info('Swagger documentation enabled at /api/docs')

  /**
   * A Fastify plugin for serving Swagger (OpenAPI v2) or OpenAPI v3 schemas
   *
   * @see {@link https://github.com/fastify/fastify-swagger}
   */
  await fastify.register(fastifySwagger, {
    hideUntagged: true,
    openapi: {
      info: {
        title: 'Fastify Demo API',
        description: 'A production-ready API with authentication and role-based access control',
        version: '1.0.0'
      }
    }
  })

  /**
   * A Fastify plugin for serving Swagger UI.
   *
   * @see {@link https://github.com/fastify/fastify-swagger-ui}
   */
  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/api/docs'
  })
})

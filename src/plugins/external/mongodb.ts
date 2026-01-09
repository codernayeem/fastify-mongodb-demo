import fp from 'fastify-plugin'
import { FastifyInstance } from 'fastify'
import fastifyMongodb from '@fastify/mongodb'

export const autoConfig = (fastify: FastifyInstance) => {
  return {
    forceClose: true,
    url: fastify.config.MONGODB_URI
  }
}

export default fp(async (fastify: FastifyInstance, opts) => {
  await fastify.register(fastifyMongodb, opts)
}, { name: 'mongodb' })

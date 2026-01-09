import { ReturnType, Static } from '@sinclair/typebox'
import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import {
  CreateTaskSchema,
  QueryTaskPaginationSchema,
  Task,
  UpdateTaskSchema
} from '../../../schemas/tasks.js'
import { Db, ClientSession, ObjectId } from 'mongodb'

declare module 'fastify' {
  export interface FastifyInstance {
    tasksRepository: ReturnType<typeof createRepository>;
  }
}

type CreateTask = Static<typeof CreateTaskSchema>
type UpdateTask = Omit<Static<typeof UpdateTaskSchema>, 'assigned_user_id'> & {
  assigned_user_id?: string | null;
  filename?: string
}

type TaskQuery = Static<typeof QueryTaskPaginationSchema>

function createRepository (fastify: FastifyInstance) {
  const db: Db = fastify.mongo.db!

  return {
    async paginate (q: TaskQuery) {
      const filter: any = {}

      if (q.author_id !== undefined) {
        filter.author_id = q.author_id
      }

      if (q.assigned_user_id !== undefined) {
        filter.assigned_user_id = q.assigned_user_id
      }

      if (q.status !== undefined) {
        filter.status = q.status
      }

      const offset = (q.page - 1) * q.limit
      const sortOrder = q.order === 'asc' ? 1 : -1

      const [tasks, total] = await Promise.all([
        db.collection('tasks')
          .find(filter)
          .sort({ created_at: sortOrder })
          .skip(offset)
          .limit(q.limit)
          .toArray(),
        db.collection('tasks').countDocuments(filter)
      ])

      return {
        tasks: tasks.map(task => {
          const { _id, ...rest } = task
          return {
            ...rest,
            id: _id.toString()
          } as Task
        }),
        total
      }
    },

    async findById (id: string, session?: ClientSession) {
      const task = await db.collection('tasks').findOne(
        { _id: new ObjectId(id) },
        { session }
      )

      if (!task) return null

      const { _id, ...rest } = task
      return {
        ...rest,
        id: _id.toString()
      } as Task
    },

    async findByFilename (filename: string) {
      const task = await db.collection('tasks').findOne(
        { filename },
        { projection: { filename: 1 } }
      )

      if (!task) return null

      return {
        filename: task.filename
      }
    },

    async create (newTask: CreateTask) {
      const result = await db.collection('tasks').insertOne({
        ...newTask,
        created_at: new Date(),
        updated_at: new Date()
      })

      return result.insertedId.toString()
    },

    async update (id: string, changes: UpdateTask, session?: ClientSession) {
      const result = await db.collection('tasks').findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...changes,
            updated_at: new Date()
          }
        },
        {
          returnDocument: 'after',
          session
        }
      )

      if (!result) return null

      const { _id, ...rest } = result
      return {
        ...rest,
        id: _id.toString()
      } as Task
    },

    async deleteFilename (filename: string, value: string | null, session: ClientSession) {
      const result = await db.collection('tasks').updateOne(
        { filename },
        { $set: { filename: value } },
        { session }
      )

      return result.modifiedCount > 0
    },

    async delete (id: string) {
      const result = await db.collection('tasks').deleteOne(
        { _id: new ObjectId(id) }
      )

      return result.deletedCount > 0
    },

    createStream () {
      return db.collection('tasks').find().stream()
    }
  }
}

export default fp(
  function (fastify) {
    fastify.decorate('tasksRepository', createRepository(fastify))
  },
  {
    name: 'tasks-repository',
    dependencies: ['mongodb']
  }
)

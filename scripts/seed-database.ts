import { MongoClient, ObjectId } from 'mongodb'
import { scryptHash } from '../src/plugins/app/password-manager.js'

if (Number(process.env.CAN_SEED_DATABASE) !== 1) {
  throw new Error("You can't seed the database. Set `CAN_SEED_DATABASE=1` environment variable to allow this operation.")
}

async function seed () {
  const client = new MongoClient(process.env.MONGODB_URI!)

  try {
    await client.connect()
    const db = client.db()

    await truncateCollections(db)
    await seedUsers(db)

    console.log('Database seeded successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await client.close()
  }
}

async function truncateCollections (db: any) {
  const collections = await db.listCollections().toArray()

  for (const collection of collections) {
    await db.collection(collection.name).deleteMany({})
  }

  console.log('All collections have been truncated successfully.')
}

async function seedUsers (db: any) {
  const users = [
    { username: 'basic', email: 'basic@example.com' },
    { username: 'moderator', email: 'moderator@example.com' },
    { username: 'admin', email: 'admin@example.com' }
  ]
  const hash = await scryptHash('Password123$')

  // The goal here is to create a role hierarchy
  // E.g. an admin should have all the roles
  const rolesAccumulator: ObjectId[] = []

  for (const user of users) {
    // Create role first
    const roleResult = await db.collection('roles').insertOne({
      name: user.username
    })

    const newRoleId = roleResult.insertedId
    rolesAccumulator.push(newRoleId)

    // Create user with accumulated roles
    await db.collection('users').insertOne({
      username: user.username,
      email: user.email,
      password: hash,
      roles: [...rolesAccumulator],
      created_at: new Date(),
      updated_at: new Date()
    })
  }

  console.log('Users have been seeded successfully.')
}

seed()

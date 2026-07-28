import mongoose from 'mongoose'
import { connectToDatabase } from '../config/db.js'
import { env } from '../config/env.js'
import { User } from '../models/User.js'
import { hashPassword } from '../services/passwordService.js'
import { generateUserCode } from '../services/userCodeService.js'

const run = async () => {
  const email = process.env.ADMIN_SEED_EMAIL
  const password = process.env.ADMIN_SEED_PASSWORD
  const phone = process.env.ADMIN_SEED_PHONE
  const fullName = process.env.ADMIN_SEED_NAME || 'PNP Admin'

  if (!email || !password || !phone) {
    throw new Error('ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, and ADMIN_SEED_PHONE must be set in your .env file')
  }

  await connectToDatabase()

  const existingAdmin = await User.findOne({ email: email.toLowerCase() })

  if (existingAdmin) {
    existingAdmin.fullName = fullName
    existingAdmin.phone = phone
    existingAdmin.role = 'admin'
    existingAdmin.passwordHash = await hashPassword(password)
    existingAdmin.isActive = true
    await existingAdmin.save()

    console.log('Admin account updated successfully')
  } else {
    const customerCode = await generateUserCode()

    await User.create({
      customerCode,
      fullName,
      email: email.toLowerCase(),
      phone,
      passwordHash: await hashPassword(password),
      role: 'admin',
      isActive: true,
    })

    console.log('Admin account created successfully')
  }

  await mongoose.connection.close()
  console.log('Database connection closed')
}

run().catch(async (error) => {
  console.error('Failed to seed admin:', error)
  await mongoose.connection.close()
  process.exit(1)
})

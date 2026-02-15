/**
 * Script to create admin user
 * Run with: node scripts/create-admin.js
 */

const crypto = require('crypto')
const mongoose = require('mongoose')

// MongoDB connection string - update if needed
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/craftopia'

// Admin credentials
const ADMIN_EMAIL = 'bugiriwilson651@gmail.com'
const ADMIN_PASSWORD = 'Wilson@2008'
const ADMIN_NAME = 'Wilson Bugiri'

// Salt for password hashing (should match your app)
const SALT = process.env.AUTH_SALT || 'craftopia-default-salt'

const hashPassword = (password) => {
  return crypto.pbkdf2Sync(password, SALT, 1000, 64, 'sha512').toString('hex')
}

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  display_name: {
    type: String,
    required: true,
  },
  avatar_url: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
})

async function createAdminUser() {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const User = mongoose.models.User || mongoose.model('User', UserSchema)

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL })
    
    if (existingAdmin) {
      console.log(`Admin user already exists: ${ADMIN_EMAIL}`)
      console.log('Updating password...')
      
      const hashedPassword = hashPassword(ADMIN_PASSWORD)
      existingAdmin.password = hashedPassword
      existingAdmin.display_name = ADMIN_NAME
      await existingAdmin.save()
      
      console.log('Admin password updated successfully!')
    } else {
      console.log('Creating admin user...')
      
      const hashedPassword = hashPassword(ADMIN_PASSWORD)
      const admin = await User.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        display_name: ADMIN_NAME,
        bio: 'Administrator',
      })

      console.log('Admin user created successfully!')
      console.log(`Email: ${admin.email}`)
      console.log(`Name: ${admin.display_name}`)
    }

    console.log('\n✅ Admin setup complete!')
    console.log(`\nYou can now login with:`)
    console.log(`Email: ${ADMIN_EMAIL}`)
    console.log(`Password: ${ADMIN_PASSWORD}`)

  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await mongoose.connection.close()
    console.log('\nDatabase connection closed')
  }
}

createAdminUser()

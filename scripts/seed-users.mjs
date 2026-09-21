#!/usr/bin/env node
/**
 * CRAFTOPIA — user seeder / account manager (owner tool).
 *
 * Usage (from craftopia_web/):
 *   npm run seed:users -- add --email a@b.com --name "Artist Name" --phone +2507... --password secret123 [--role user|staff|admin] [--force]
 *   npm run seed:users -- list
 *   npm run seed:users -- password --email a@b.com --password newpass123
 *   npm run seed:users -- remove --email a@b.com [--yes]
 *   npm run seed:users -- help
 *
 * Notes:
 *  - Passwords are hashed with the exact same scheme as the website
 *    (pbkdf2 sha512, AUTH_SALT env or the app's default salt), so seeded
 *    accounts sign in normally on the web (and on mobile if the email is
 *    listed in ADMIN_EMAILS).
 *  - `add` on an existing email does nothing unless you pass --force
 *    (which updates profile fields + password, keeping the account).
 *  - Connects to MONGODB_URI from .env.local / .env — same as the app.
 */

import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"
import mongoose from "mongoose"

// ---------------------------------------------------------------------------
// env loading (same precedence as Next.js: .env.local overrides .env)
// ---------------------------------------------------------------------------
const ROOT = path.resolve(process.cwd())
for (const file of [".env", ".env.local"]) {
  const full = path.join(ROOT, file)
  if (!fs.existsSync(full)) continue
  for (const line of fs.readFileSync(full, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!m) continue
    const value = m[2].replace(/^["']|["']$/g, "")
    if (!(m[1] in process.env)) process.env[m[1]] = value
  }
}

// ---------------------------------------------------------------------------
// model (mirrors lib/db/models/User.ts + hashing from lib/actions/user.actions.ts)
// ---------------------------------------------------------------------------
const SALT = process.env.AUTH_SALT || "craftopia-default-salt"
const hashPassword = (password) =>
  crypto.pbkdf2Sync(password, SALT, 1000, 64, "sha512").toString("hex")

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    phone_number: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    display_name: { type: String, required: true },
    avatar_url: { type: String, default: "" },
    bio: { type: String, default: "" },
    role: { type: String, enum: ["user", "staff", "admin"], default: "user" },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true }
)
const User = mongoose.models.User || mongoose.model("User", UserSchema)

// ---------------------------------------------------------------------------
// cli parsing
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const command = argv[0] || "help"
  const flags = {}
  for (let i = 1; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith("--")) continue
    const eq = arg.indexOf("=")
    if (eq > -1) {
      flags[arg.slice(2, eq)] = arg.slice(eq + 1)
    } else {
      const next = argv[i + 1]
      if (next && !next.startsWith("--")) {
        flags[arg.slice(2)] = next
        i++
      } else {
        flags[arg.slice(2)] = true // boolean flag like --yes / --force
      }
    }
  }
  return { command, flags }
}

const errors = []
const fail = (msg) => errors.push(msg)

function validateUserInput(flags, { requirePassword }) {
  const email = (flags.email || "").trim().toLowerCase()
  const name = (flags.name || "").trim()
  const phone = (flags.phone || "").trim()
  const password = flags.password || ""

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("--email must be a valid email address")
  if (name.length < 2) fail("--name is required (the public display name)")
  if (phone.length < 7) fail('--phone is required, e.g. --phone "+250788123456"')
  if (requirePassword && password.length < 6) fail("--password must be at least 6 characters")
  if (flags.role && !["user", "staff", "admin"].includes(flags.role))
    fail("--role must be user, staff or admin")

  return { email, name, phone, password, role: flags.role || "user" }
}

const HELP = `
CRAFTOPIA account manager — add artists & admins to the gallery database.

  npm run seed:users -- add --email artist@mail.com --name "Jean Uwase" \\
        --phone "+250788123456" --password theirpass123 [--role user] [--force]

      Creates the account. Roles: user (artist/artist-to-be), staff, admin.
      --force   if the email already exists, update name/phone/password/role
                instead of refusing.
      Tip: an account with --role admin is treated as admin by the APIs.
      For the mobile app, also add the email to ADMIN_EMAILS in your env.

  npm run seed:users -- list
      Shows every account (never prints passwords).

  npm run seed:users -- password --email artist@mail.com --password newpass123
      Resets the password for one account (hashes it exactly like the site).

  npm run seed:users -- remove --email artist@mail.com [--yes]
      Deletes an account. --yes skips the confirmation.
      (Their artworks keep their artist_id but will need reassignment —
       prefer suspending instead: not supported here yet.)

  npm run seed:users -- help
      This text.
`

async function main() {
  const { command, flags } = parseArgs(process.argv.slice(2))

  if (command === "help" || flags.help) {
    console.log(HELP)
    return
  }

  if (command === "add" || command === "password" || command === "remove") {
    const email = (flags.email || "").trim().toLowerCase()
    if (command !== "add" && !email) fail("--email is required")
    if (command === "password" && ((flags.password || "").length < 6))
      fail("--password must be at least 6 characters")
    if (command === "remove" && !flags.yes)
      fail("refusing to delete without --yes (this cannot be undone)")
  } else if (command !== "list") {
    fail(`unknown command "${command}" — try: add | list | password | remove | help`)
  }

  if (errors.length) {
    for (const e of errors) console.error(`✗ ${e}`)
    console.error("\nRun `npm run seed:users -- help` for usage.")
    process.exit(2)
  }

  if (!process.env.MONGODB_URI) {
    console.error("✗ MONGODB_URI not found in .env.local / .env — cannot connect.")
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false })

  try {
    switch (command) {
      case "add": {
        const input = validateUserInput(flags, { requirePassword: true })
        if (errors.length) {
          for (const e of errors) console.error(`✗ ${e}`)
          process.exit(2)
        }

        const existing = await User.findOne({ email: input.email })
        if (existing && !flags.force) {
          console.error(
            `✗ ${input.email} already exists (${existing.role}, ${existing.status}).\n` +
              `  Use --force to update it, or 'password' to reset its password.`
          )
          process.exit(1)
        }

        if (existing) {
          await User.updateOne(
            { email: input.email },
            { $set: {
                display_name: input.name,
                phone_number: input.phone,
                password: hashPassword(input.password),
                role: input.role,
            } }
          )
          console.log(`✓ Updated ${input.email} (${input.role}) — id ${existing._id}`)
        } else {
          const user = await User.create({
            email: input.email,
            display_name: input.name,
            phone_number: input.phone,
            password: hashPassword(input.password),
            role: input.role,
            status: "active",
          })
          console.log(`✓ Created ${input.email} (${input.role}) — id ${user._id}`)
          console.log(`  They can sign in on the website with this email + password.`)
        }
        break
      }

      case "list": {
        const users = await User.find().sort({ createdAt: -1 }).lean()
        if (!users.length) {
          console.log("No users in the database yet.")
          break
        }
        const rows = users.map((u) => ({
          id: u._id.toString(),
          email: u.email,
          name: u.display_name,
          phone: u.phone_number,
          role: u.role,
          status: u.status,
          joined: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : "?",
        }))
        console.table(rows)
        console.log(`${rows.length} account(s).`)
        break
      }

      case "password": {
        const user = await User.findOne({ email: (flags.email || "").trim().toLowerCase() })
        if (!user) {
          console.error(`✗ No account found for ${flags.email}`)
          process.exit(1)
        }
        // updateOne (not save) so legacy docs with missing fields still update
        await User.updateOne(
          { email: user.email },
          { $set: { password: hashPassword(flags.password) } }
        )
        console.log(`✓ Password reset for ${user.email} (${user.role})`)
        break
      }

      case "remove": {
        const user = await User.findOne({ email: (flags.email || "").trim().toLowerCase() })
        if (!user) {
          console.error(`✗ No account found for ${flags.email}`)
          process.exit(1)
        }
        await user.deleteOne()
        console.log(`✓ Removed ${user.email} (${user.role})`)
        console.log(
          `  Note: artworks uploaded by this account still reference their old id.`
        )
        break
      }
    }
  } finally {
    await mongoose.disconnect()
  }
}

main().catch((err) => {
  console.error("✗ Unexpected error:", err.message)
  process.exit(1)
})

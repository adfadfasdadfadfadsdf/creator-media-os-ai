const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS User (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    )
  `)
  await prisma.$executeRawUnsafe(
    "CREATE UNIQUE INDEX IF NOT EXISTS User_email_key ON User(email)"
  )
  await prisma.$executeRawUnsafe(
    "CREATE INDEX IF NOT EXISTS User_email_idx ON User(email)"
  )
  console.log("SQLite authentication database initialized.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const employeePassword = await bcrypt.hash("employee123", 10);

  await prisma.user.upsert({
    where: { email: "admin@bank.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@bank.com",
      password: adminPassword,
      role: "admin",
    },
  });

  await prisma.user.upsert({
    where: { email: "employee@bank.com" },
    update: {},
    create: {
      name: "Employee User",
      email: "employee@bank.com",
      password: employeePassword,
      role: "employee",
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

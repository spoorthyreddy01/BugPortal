import { connectDB } from "../lib/db.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import { ROLES, USER_STATUS, DEFAULT_PROJECTS, SEED_ADMIN_EMAIL } from "../config/constants.js";
import dns from 'node:dns/promises';

dns.setServers(['1.1.1.1', '8.8.8.8']);
async function seed() {
  await connectDB();

  const admin = await User.findOneAndUpdate(
    { email: SEED_ADMIN_EMAIL.toLowerCase() },
    {
      $setOnInsert: {
        name: "Spoorthy",
        email: SEED_ADMIN_EMAIL.toLowerCase(),
        role: ROLES.ADMIN,
        status: USER_STATUS.ACTIVE,
      },
    },
    { upsert: true, new: true }
  );
  console.log(`Admin ready: ${admin.email} (role=${admin.role}, status=${admin.status})`);

  for (const name of DEFAULT_PROJECTS) {
    const project = await Project.findOneAndUpdate(
      { name },
      { $setOnInsert: { name, description: "", isArchived: false } },
      { upsert: true, new: true }
    );
    console.log(`Project ready: ${project.name}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

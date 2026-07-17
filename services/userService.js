import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Issue from "@/models/Issue";
import ActivityLog from "@/models/ActivityLog";
import { ROLE_VALUES, USER_STATUS, ACTIVITY_TYPES } from "@/config/constants";

export async function listUsers({ q = "" } = {}) {
  await connectDB();

  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  return User.find(filter).sort({ createdAt: -1 }).lean();
}

export async function createAuthorizedUser({ email, role }) {
  await connectDB();

  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    const err = new Error("Email is required");
    err.status = 400;
    throw err;
  }

  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    const err = new Error("A user with this email already exists");
    err.status = 409;
    throw err;
  }

  return User.create({
    email: normalizedEmail,
    role: ROLE_VALUES.includes(role) ? role : undefined,
    status: USER_STATUS.INACTIVE,
  });
}

export async function updateUser(id, updates) {
  await connectDB();

  const allowed = {};
  if (updates.role && ROLE_VALUES.includes(updates.role)) {
    allowed.role = updates.role;
  }
  if (
    updates.status &&
    Object.values(USER_STATUS).includes(updates.status)
  ) {
    allowed.status = updates.status;
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: allowed },
    { new: true }
  );

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return user;
}

export async function getUserProfile(userId) {
  await connectDB();

  const [user, reportedCount, resolvedCount, activeCount] = await Promise.all(
    [
      User.findById(userId).lean(),
      Issue.countDocuments({ reporter: userId }),
      ActivityLog.countDocuments({
        type: ACTIVITY_TYPES.ISSUE_RESOLVED,
        actor: userId,
      }),
      Issue.countDocuments({ currentDeveloper: userId }),
    ]
  );

  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return { user, reportedCount, resolvedCount, activeCount };
}

export async function deleteUser(id) {
  await connectDB();

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }

  return user;
}

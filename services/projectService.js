import { connectDB } from "@/lib/db";
import Project from "@/models/Project";
import Issue from "@/models/Issue";

function httpError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function listProjectsWithCounts({ includeArchived = false } = {}) {
  await connectDB();

  const filter = includeArchived ? {} : { isArchived: false };
  const projects = await Project.find(filter).sort({ name: 1 }).lean();

  const counts = await Issue.aggregate([
    { $group: { _id: "$project", count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(
    counts.map((c) => [c._id.toString(), c.count])
  );

  return projects.map((p) => ({
    ...p,
    issueCount: countMap[p._id.toString()] || 0,
  }));
}

export async function createProject({ name, description }) {
  await connectDB();

  const trimmed = (name || "").trim();
  if (!trimmed) throw httpError("Project name is required", 400);

  const existing = await Project.findOne({ name: trimmed });
  if (existing) {
    throw httpError("A project with this name already exists", 409);
  }

  return Project.create({ name: trimmed, description: description || "" });
}

export async function updateProject(id, updates) {
  await connectDB();

  const allowed = {};
  if (typeof updates.name === "string" && updates.name.trim()) {
    allowed.name = updates.name.trim();
  }
  if (typeof updates.description === "string") {
    allowed.description = updates.description;
  }
  if (typeof updates.isArchived === "boolean") {
    allowed.isArchived = updates.isArchived;
  }

  const project = await Project.findByIdAndUpdate(
    id,
    { $set: allowed },
    { new: true }
  );
  if (!project) throw httpError("Project not found", 404);

  return project;
}

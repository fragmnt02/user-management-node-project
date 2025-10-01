import { createUserSchema, updateUserSchema, listUsersSchema } from "../validators/user.schema";
import type { ZodIssue } from "zod";
import { geocodeByZip } from "../services/openweather.service";
import { asyncHandler } from "../middlewares/async";
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../services/users.service";

// GET /api/users
export const handleList = asyncHandler(async (req, res) => {
  const parse = listUsersSchema.safeParse(req.query);
  if (!parse.success) {
    const details = formatZodIssues(parse.error.issues);
    return res
      .status(400)
      .json({ error: { message: "Invalid query parameters", details } });
  }

  const paginatedUsers = await listUsers(parse.data);
  return res.json(paginatedUsers);
});

function formatZodIssues(issues: ZodIssue[]) {
  return issues.map((issue) => ({
    path: issue.path?.join(".") || "",
    message: issue.message,
    code: issue.code,
    // Some issue types include expected/received; guard with optional access
    expected: (issue as any)?.expected,
    received: (issue as any)?.received,
  }));
}

// GET /api/users/:id
export const handleGet = asyncHandler(async (req, res) => {
  const id = String(req.params?.id || "");
  const user = await getUser(id);
  if (!user) {
    return res.status(404).json({ error: { message: "User not found" } });
  }
  return res.json({ data: user });
});

// POST /api/users
export const handleCreate = asyncHandler(async (req, res) => {
  const parse = createUserSchema.safeParse(req.body);
  if (!parse.success) {
    const details = formatZodIssues(parse.error.issues);
    return res
      .status(400)
      .json({ error: { message: "Invalid request body", details } });
  }

  const { name, zipCode, country } = parse.data;
  const { lat, lon, timezone } = await geocodeByZip({ zipCode, country });

  const newUser = await createUser({
    name,
    zipCode,
    country,
    latitude: lat,
    longitude: lon,
    timezone,
  });

  return res.status(201).json({ data: newUser });
});

// PATCH /api/users/:id
export const handleUpdate = asyncHandler(async (req, res) => {
  const parse = updateUserSchema.safeParse(req.body);
  if (!parse.success) {
    const details = formatZodIssues(parse.error.issues);
    return res
      .status(400)
      .json({ error: { message: "Invalid request body", details } });
  }

  const id = String(req.params?.id || "");
  const existing = await getUser(id);
  if (!existing) {
    return res.status(404).json({ error: { message: "User not found" } });
  }

  let updates = { ...parse.data };

  // If zip changed, re-fetch coordinates/timezone
  const zipChanged =
    typeof updates.zipCode === "string" && updates.zipCode !== existing.zipCode;
  const country = updates.country || existing.country || "US";

  if (zipChanged) {
    const { lat, lon, timezone } = await geocodeByZip({
      zipCode: updates.zipCode as string,
      country,
    });
    updates = {
      ...updates,
      latitude: lat,
      longitude: lon,
      timezone,
    };
  }

  const saved = await updateUser(id, updates);
  return res.json({ data: saved });
});

// DELETE /api/users/:id
export const handleDelete = asyncHandler(async (req, res) => {
  const id = String(req.params?.id || "");
  const ok = await deleteUser(id);
  if (!ok) {
    return res.status(404).json({ error: { message: "User not found" } });
  }
  return res.status(204).send();
});

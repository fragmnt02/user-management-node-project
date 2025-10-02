import { db } from "../config/firebase";
import { z } from "zod";
import { createUserSchema, updateUserSchema, listUsersSchema } from "../validators/user.schema";

type CreateUser = z.infer<typeof createUserSchema>;
type UpdateUser = z.infer<typeof updateUserSchema>;
type ListUsersParams = z.infer<typeof listUsersSchema>;
type StoredUser = CreateUser & { createdAt: number; updatedAt: number };
type User = { id: string } & StoredUser;

export interface PaginatedUsers {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

if (!db) {
  throw new Error("Firebase database is not configured. Please set FIREBASE_DB_URL environment variable.");
}

const USERS_REF = db.ref("users");

export async function listUsers(params?: ListUsersParams): Promise<PaginatedUsers> {
  const snap = await USERS_REF.get();
  const val = (snap.val() || {}) as Record<string, StoredUser>;
  
  // Convert {id: {..}} to array
  const allUsers = Object.entries(val).map(([id, payload]) => ({ id, ...payload }));
  
  // If no pagination params, return all users (backward compatibility)
  if (!params) {
    return {
      data: allUsers,
      pagination: {
        page: 1,
        limit: allUsers.length,
        total: allUsers.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
  
  const { page, limit } = params;
  const total = allUsers.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  
  // Sort users by createdAt (newest first) for consistent pagination
  const sortedUsers = allUsers.sort((a, b) => b.createdAt - a.createdAt);
  const paginatedUsers = sortedUsers.slice(offset, offset + limit);
  
  return {
    data: paginatedUsers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

export async function getUser(id: string): Promise<User | null> {
  const snap = await USERS_REF.child(id).get();
  if (!snap.exists()) return null;
  return { id, ...(snap.val() as StoredUser) };
}

export async function createUser(payload: CreateUser): Promise<User> {
  const ref = USERS_REF.push();
  const toSave: StoredUser = { ...payload, createdAt: Date.now(), updatedAt: Date.now() };
  await ref.set(toSave);
  return { id: String(ref.key), ...toSave };
}

export async function updateUser(
  id: string,
  partial: UpdateUser
): Promise<User | null> {
  const exists = await USERS_REF.child(id).get();
  if (!exists.exists()) return null;
  const updates: Partial<StoredUser> = { ...partial, updatedAt: Date.now() };
  await USERS_REF.child(id).update(updates);
  const snap = await USERS_REF.child(id).get();
  return { id, ...(snap.val() as StoredUser) };
}

export async function deleteUser(id: string): Promise<boolean> {
  const snap = await USERS_REF.child(id).get();
  if (!snap.exists()) return false;
  await USERS_REF.child(id).remove();
  return true;
}

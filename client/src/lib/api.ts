const BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8080/api";

export type User = {
  id: string;
  name: string;
  zipCode: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  createdAt?: number;
  updatedAt?: number;
};

type ListResponse = { data: User[]; count: number };
type ItemResponse = { data: User };

export async function listUsers(): Promise<User[]> {
  const r = await fetch(`${BASE}/users`);
  const j: ListResponse = await r.json();
  return j.data;
}

export async function createUser(input: {
  name: string;
  zipCode: string;
  country?: string;
}): Promise<User> {
  const r = await fetch(`${BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!r.ok) throw new Error("Failed to create user");
  const j: ItemResponse = await r.json();
  return j.data;
}

export async function updateUser(
  id: string,
  partial: Partial<User>
): Promise<User> {
  const r = await fetch(`${BASE}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partial),
  });
  if (!r.ok) throw new Error("Failed to update user");
  const j: ItemResponse = await r.json();
  return j.data;
}

export async function deleteUser(id: string): Promise<void> {
  const r = await fetch(`${BASE}/users/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error("Failed to delete user");
}

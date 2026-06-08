export type Role = "ADMIN" | "MANAGER" | "MEMBER";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export type SessionPayload = {
  userId: string;
  role: Role;
};

import type { User } from "../drizzle/schema";
import { ENV } from "./_core/env";

export function isCareerAdmin(
  user: Pick<User, "role" | "openId"> | null | undefined,
  ownerOpenId: string = ENV.ownerOpenId,
): boolean {
  if (!user) return false;
  return user.role === "admin" || (ownerOpenId.length > 0 && user.openId === ownerOpenId);
}

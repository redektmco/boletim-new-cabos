"use server";

import { redirect } from "next/navigation";
import { destroySession, requireUser } from "@/lib/auth/session";

export async function logoutAction() {
  await requireUser();
  await destroySession();
  redirect("/admin/login");
}

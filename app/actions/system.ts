"use server";

import { prisma } from "@/lib/prisma";

export async function getDatabaseStatus(): Promise<{
  online: boolean;
  latencyMs: number | null;
}> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { online: true, latencyMs: Date.now() - start };
  } catch {
    return { online: false, latencyMs: null };
  }
}

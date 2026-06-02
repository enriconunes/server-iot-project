import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

// IMPORTANTE (serverless / Vercel):
// Em runtime usamos a ligação POOLED (pgbouncer, porta 6543 = DATABASE_URL).
// A DIRECT_URL (porta 5432) é uma ligação direta/sessão e serve apenas para as
// migrações. Usar a direta em runtime esgota as ligações da base de dados
// quando há muitos pedidos (dashboard + ESP32 em polling) -> erros 500.
function createPrismaClient() {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.DIRECT_URL;
  // max: 1 -> cada instância serverless usa UMA ligação ao pooler (recomendação
  // oficial Prisma para serverless). Evita esgotar o pooler do Supabase e os
  // 500 intermitentes. idleTimeoutMillis baixo liberta a ligação depressa.
  const adapter = new PrismaPg({
    connectionString,
    max: 1,
    idleTimeoutMillis: 10_000,
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Reutiliza a mesma instância (e o mesmo pool) entre invocações na mesma
// instância, evitando criar pools a mais.
globalForPrisma.prisma = prisma;

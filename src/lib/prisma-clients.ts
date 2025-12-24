import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

/**
 * Client pour un service spécifique.
 * Injecte automatiquement le filtre `serviceId` dans toutes les requêtes.
 */
export const getServiceClient = (serviceId: string) => {
    return prisma.$extends({
        query: {
            user: {
                async findMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async findFirst({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async count({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async findUnique({ args, query }) {
                    const result = await query(args);
                    if (result && (result as any).serviceId !== serviceId) {
                        return null;
                    }
                    return result;
                },
                async create({ args, query }) {
                    // Ne pas injecter serviceId si la relation service est déjà définie (évite le conflit)
                    if (!(args.data as any)?.service) {
                        (args as any).data = { ...args.data, serviceId };
                    }
                    return query(args);
                },
                async update({ args, query }) {
                    return query(args);
                },
                async delete({ args, query }) {
                    return query(args);
                },
                async groupBy({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async aggregate({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                }
            },
            gestionnaire: {
                async findMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async findFirst({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async count({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async findUnique({ args, query }) {
                    const result = await query(args);
                    if (result && (result as any).serviceId !== serviceId) return null;
                    return result;
                },
                async create({ args, query }) {
                    (args as any).data = { ...args.data, serviceId };
                    return query(args);
                },
                async update({ args, query }) {
                    return query(args);
                }
            },
            settings: {
                async findFirst({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async create({ args, query }) {
                    (args as any).data = { ...args.data, serviceId };
                    return query(args);
                },
                async update({ args, query }) {
                    return query(args);
                }
            },
            dropdownOption: {
                async findMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async findFirst({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async create({ args, query }) {
                    (args as any).data = { ...args.data, serviceId };
                    return query(args);
                },
                async findUnique({ args, query }) {
                    const result = await query(args);
                    if (result && (result as any).serviceId !== serviceId) return null;
                    return result;
                }
            }
        },
    });
};

/**
 * Client Super-Admin (Global)
 * Accès direct sans filtre. À utiliser uniquement pour les dashboard globaux.
 */
export const getGlobalClient = () => {
    return prisma;
}

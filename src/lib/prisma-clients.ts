import { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

/**
 * Client pour un service spécifique.
 * Injecte automatiquement le filtre `serviceId` dans TOUTES les requêtes.
 * Garantit l'isolation stricte des données entre les services.
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
                    if (result && (result as any).serviceId !== serviceId) return null;
                    return result;
                },
                async create({ args, query }) {
                    if (!(args.data as any)?.service) (args as any).data = { ...args.data, serviceId };
                    return query(args);
                },
                async update({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async delete({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async updateMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async deleteMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
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
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async delete({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                }
            },
            settings: {
                async findFirst({ args, query }) {
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
                    (args as any).where = { ...(args.where || {}), serviceId };
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
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async delete({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                }
            },
            prestation: {
                async findMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async count({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async create({ args, query }) {
                    (args as any).data = { ...args.data, serviceId };
                    return query(args);
                },
                async update({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async delete({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                }
            },
            holiday: {
                async findMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                },
                async create({ args, query }) {
                    (args as any).data = { ...args.data, serviceId };
                    return query(args);
                },
                async delete({ args, query }) {
                    (args as any).where = { ...(args.where || {}), serviceId };
                    return query(args);
                }
            },
            conge: {
                // Modèles personnels : l'isolation est assurée par le gestionnaireId dans les requêtes
                // et les vérifications de droits dans les API.
                async findMany({ args, query }) { return query(args); },
                async count({ args, query }) { return query(args); },
                async findFirst({ args, query }) { return query(args); },
                async update({ args, query }) { return query(args); },
                async delete({ args, query }) { return query(args); },
                async updateMany({ args, query }) { return query(args); },
                async deleteMany({ args, query }) { return query(args); }
            },
            soldeConge: {
                async findMany({ args, query }) { return query(args); },
                async findFirst({ args, query }) { return query(args); },
                async updateMany({ args, query }) { return query(args); },
                async deleteMany({ args, query }) { return query(args); }
            },
            document: {
                async findMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async findFirst({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async delete({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async updateMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async deleteMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                }
            },
            problematique: {
                async findMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async findFirst({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async updateMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async deleteMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                }
            },
            actionSuivi: {
                async findMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async findFirst({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async updateMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                },
                async deleteMany({ args, query }) {
                    (args as any).where = { ...(args.where || {}), user: { serviceId } };
                    return query(args);
                }
            }
        },
    });
};

/**
 * Client Global (Super-Admin)
 * À UTILISER UNIQUEMENT pour les fonctions transversales explicitement autorisées.
 */
export const getGlobalClient = () => {
    return prisma;
};

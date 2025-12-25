/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - useUserMigration Hook
Extracted from useUser.ts
*/

import { useCallback, useState } from 'react';
import { User } from '@/types';
import { MigrationStatus, MigrationResult } from './useUser.types';
import { migrateExistingUsers } from '@/utils/migrationFunction';
import { UserOperationResult } from './useUser.types';

// Note: I'm adding a default initial state since I'll need it
export const useUserMigration = (
    fetchUsers: (force: boolean) => Promise<User[]>,
    updateUser: (id: string, data: Partial<User>) => Promise<UserOperationResult>
) => {
    const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
        done: false,
        inProgress: false,
        results: null
    });

    const migrateUsers = useCallback(async (): Promise<MigrationResult> => {
        setMigrationStatus({
            done: false,
            inProgress: true,
            results: null
        });

        try {
            const allUsers = await fetchUsers(true);
            const results = migrateExistingUsers(allUsers, {
                createBackup: true,
                validateAfterMigration: true,
                fixInconsistencies: true,
                logProgress: true
            });

            let successCount = 0;
            for (const user of results.migratedUsers) {
                try {
                    const userId = user.id || (user as any)._id;
                    const updateResult = await updateUser(userId, user);
                    if (updateResult.success) successCount++;
                } catch (err) {
                    console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
                }
            }

            setMigrationStatus({
                done: true,
                inProgress: false,
                results: {
                    totalMigrated: results.migrated,
                    totalSaved: successCount,
                    errors: results.errors.map(err => err.message)
                }
            });

            return {
                success: true,
                totalMigrated: results.migrated,
                totalSaved: successCount
            };
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
            setMigrationStatus({
                done: true,
                inProgress: false,
                results: {
                    totalMigrated: 0,
                    totalSaved: 0,
                    errors: [errorMessage]
                }
            });
            return { success: false, error: errorMessage };
        }
    }, [fetchUsers, updateUser]);

    return { migrationStatus, migrateUsers };
};

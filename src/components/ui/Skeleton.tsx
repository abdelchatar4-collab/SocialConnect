/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for merging classes

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, ...props }) => {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-gray-200/75 dark:bg-gray-800/75", className)}
            {...props}
        />
    );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
    return (
        <div className="w-full">
            <div className="flex items-center py-4 gap-2">
                <Skeleton className="h-10 w-[250px]" />
                <Skeleton className="h-10 w-[100px] ml-auto" />
            </div>
            <div className="border rounded-md">
                <div className="p-4 border-b bg-gray-50">
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-0 flex gap-4 items-center">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-3 w-[150px]" />
                        </div>
                        <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export const GridSkeleton: React.FC<{ cards?: number }> = ({ cards = 8 }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {Array.from({ length: cards }).map((_, i) => (
                <div key={i} className="border rounded-2xl p-6 space-y-4 bg-white shadow-sm">
                    <div className="flex justify-between">
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[20px]" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-[180px]" />
                        <Skeleton className="h-4 w-[120px]" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-[60px] rounded-full" />
                        <Skeleton className="h-6 w-[60px] rounded-full" />
                    </div>
                    <div className="pt-4 flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-[80px]" />
                            <Skeleton className="h-2 w-[50px]" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

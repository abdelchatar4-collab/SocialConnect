export interface ImportProgress {
    current: number;
    total: number;
    percentage?: number;
    status: string;
    isBatch?: boolean;
    fileName?: string;
}

export interface ImportResults {
    totalRows: number;
    processedUsers: number;
    errors: number;
}

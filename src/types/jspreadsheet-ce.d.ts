/*
Copyright (C) 2025 AC
Type declarations for jspreadsheet-ce
*/

declare module 'jspreadsheet-ce' {
    interface JSpreadsheetOptions {
        data?: any[][];
        columns?: any[];
        minDimensions?: [number, number];
        tableOverflow?: boolean;
        tableWidth?: string;
        tableHeight?: string;
        allowInsertRow?: boolean;
        allowInsertColumn?: boolean;
        allowDeleteRow?: boolean;
        allowDeleteColumn?: boolean;
        allowRenameColumn?: boolean;
        columnSorting?: boolean;
        search?: boolean;
        pagination?: number;
        paginationOptions?: number[];
        contextMenu?: (obj: any, x: any, y: any, e: any) => any[];
        onchange?: (...args: any[]) => void;
        oninsertrow?: (...args: any[]) => void;
        ondeleterow?: (...args: any[]) => void;
        [key: string]: any;
    }

    interface JSpreadsheetInstance {
        getData: () => any[][];
        getHeaders: (includeHidden?: boolean) => string[];
        search: (query: string) => void;
        resetSearch: () => void;
        undo: () => void;
        redo: () => void;
        insertRow: (num?: number, rowNumber?: number, insertBefore?: boolean) => void;
        deleteRow: (rowNumber: number, numOfRows?: number) => void;
        orderBy: (column: number, direction: number) => void;
        getSelectedRows: () => number[];
        cut: () => void;
        copy: () => void;
        paste: () => void;
        [key: string]: any;
    }

    function jspreadsheet(el: HTMLElement, options: JSpreadsheetOptions): JSpreadsheetInstance;

    namespace jspreadsheet {
        function destroy(el: HTMLElement): void;
    }

    export = jspreadsheet;
}

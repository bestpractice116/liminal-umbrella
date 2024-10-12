import * as z from 'zod';
import { QueryKey as TanstackQueryKey } from '@tanstack/react-query';
import { FormInstance } from 'antd/es/form';
import { createContext } from 'react';

import { ColumnTypeArray, QueryKey, QueryKeyElement, SaveHandler } from './types';

export function getColumns<Item>(columns: ColumnTypeArray<Item>, handleSave: SaveHandler<Item>) {
    return columns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: Item) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave
            })
        };
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zodErrorConvertor(data: any): Error | undefined {
    if (data.status && data.status !== 'ok' && data.error) {
        console.error('Error updating data', data);
        return new z.ZodError(data.error);
    }
    return;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function zodErrorConvertorThrow(data: any, onSuccess?: () => void) {
    const maybeError = zodErrorConvertor(data);
    if (maybeError) throw maybeError;
    if (onSuccess) onSuccess();
}

export function coerceQueryKey(key: QueryKey): TanstackQueryKey {
    if (typeof key === 'number' || typeof key === 'string') {
        return [`${key}`];
    }
    return Array.from(key, (v: QueryKeyElement) => `${v}`);
}

 
export function getEditableContext(): React.Context<FormInstance | null> {
     
    return createContext<FormInstance | null>(null);
}

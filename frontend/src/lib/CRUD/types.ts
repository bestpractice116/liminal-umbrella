import { GetRef } from 'antd/es/_util/type';
import { FormInstance } from 'antd/es/form';
import Input from 'antd/es/input';
import Table, { ColumnGroupType, ColumnType } from 'antd/es/table';
import { RefObject, FC } from 'react';

export interface Keyable {
    key: string | number | bigint
    [map: string]: unknown
}

export interface MutationReturn<T extends Keyable> {
    status: 'ok',
    datum: T,
}

export interface DeleteReturn<T extends Keyable> {
    status: 'deleted',
    datum: T,
}

export type InputRef = GetRef<typeof Input>;

export interface EditableCellProps<T> {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof T;
    record: T;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    handleSave: (record: T, form: FormInstance, _: Function) => void;
}

export type EditableTableProps = Parameters<typeof Table>[0];
export type ColumnTypes<T> = ColumnGroupType<T> | ColumnType<T>;
export type ColumnTypeArray<T> = (ColumnTypes<T> & { editable?: boolean; dataIndex: string })[];
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type SaveHandler<Item> = (row: Item, form: RefObject<FormInstance>, toggleEdit: () => void) => boolean;
export type DefaultColumns<T> = (ColumnTypes<T> & { editable?: boolean; dataIndex: string })[];

export interface Item {
    key: string;
    name: string;
}

export interface EditableRowProps {
    index: number;
}

export interface TableComponents {
    body: {
        row: FC<EditableRowProps>;
        cell: FC<EditableCellProps<Item>>;
    };
}

export type QueryKeyElement = string | number;
export type QueryKey = QueryKeyElement | readonly QueryKeyElement[];

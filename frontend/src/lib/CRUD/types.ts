import { GetRef } from 'antd/es/_util/type';
import { FormInstance } from 'antd/es/form';
import Input from 'antd/es/input';
import Table from 'antd/es/table';
import { RefObject, FC } from 'react';

export type InputRef = GetRef<typeof Input>;

export interface EditableCellProps<T> {
	title: React.ReactNode;
	editable: boolean;
	dataIndex: keyof T;
	record: T;
	// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
	handleSave: (record: T, form: FormInstance<any>, _: Function) => void;
}

export type EditableTableProps = Parameters<typeof Table>[0];
export type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;
export type ColumnTypeArray = Array<ColumnTypes[number] & { editable?: boolean; dataIndex: string }>;
export type SaveHandler<Item> = {
	// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
	(row: Item, form: RefObject<FormInstance<any>>, toggleEdit: Function): boolean;
};
export type DefaultColumns = Array<ColumnTypes[number] & { editable?: boolean; dataIndex: string }>;

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

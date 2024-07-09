import { createContext, type FC, useState, useContext, useRef, useEffect } from 'react';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { useQueryClient, useQuery, useMutation, UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type { GetRef } from 'antd/es/_util/type';
import Input from 'antd/es/input';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Spin from 'antd/es/spin';
import { EditOutlined } from '@ant-design/icons';
import * as z from 'zod';
import { FormRef } from 'rc-field-form/es/interface.js';
import { useErrorBoundary, ErrorFallback } from './ErrorFallback';
import { SchemaBundle } from 'common/schema';
import { getZObject } from 'common';
import { createSchemaFieldRule } from 'antd-zod';

type InputRef = GetRef<typeof Input>;
type FormInstance<T> = GetRef<typeof Form<T>>;

interface EditableCellProps<T> {
	title: React.ReactNode;
	editable: boolean;
	dataIndex: keyof T;
	record: T;
	handleSave: (record: T, form: FormInstance<any>, _: Function) => void;
}

type EditableTableProps = Parameters<typeof Table>[0];
export type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;
export type ColumnTypeArray = Array<ColumnTypes[number] & { editable?: boolean; dataIndex: string }>;
export type SaveHandler<Item> = {
	(row: Item, form: FormRef<any>, toggleEdit: Function): Boolean;
};
export type DefaultColumns = Array<ColumnTypes[number] & { editable?: boolean; dataIndex: string }>;

interface Item {
	key: string;
	name: string;
}

function getEditableContext(): React.Context<FormInstance<any> | null> {
	return createContext<FormInstance<any> | null>(null);
}

interface EditableRowProps {
	index: number;
}

export interface TableComponents {
	body: {
		row: FC<EditableRowProps>;
		cell: FC<EditableCellProps<Item>>;
	};
}

export function getTableComponents(schema: SchemaBundle) {
	const formRule = createSchemaFieldRule(getZObject(schema.update || schema.read));
	const EditableContext = getEditableContext();
	const EditableRow: FC<EditableRowProps> = ({ index, ...props }) => {
		const [form] = Form.useForm();
		return (
			<Form form={form} component={false}>
				<EditableContext.Provider value={form}>
					<tr {...props} />
				</EditableContext.Provider>
			</Form>
		);
	};
	const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps<Item>>> = ({
		title,
		editable,
		children,
		dataIndex,
		record,
		handleSave,
		...restProps
	}) => {
		const [editing, setEditing] = useState(false);
		const inputRef = useRef<InputRef>(null);
		const form = useContext(EditableContext)!;

		useEffect(() => {
			if (editing) {
				inputRef.current?.focus();
			}
		}, [editing]);

		const toggleEdit = () => {
			setEditing(!editing);
			form.setFieldsValue({ [dataIndex]: record[dataIndex] });
		};

		const save = async () => {
			try {
				const values = await form.validateFields();
				handleSave({ ...record, ...values }, form, toggleEdit);
			} catch (errInfo) {
				console.log('Save failed:', errInfo);
			}
		};

		let childNode = children;

		if (editable) {
			childNode = editing ? (
				<Form.Item style={{ margin: 0 }} name={dataIndex} rules={[formRule]}>
					<Input ref={inputRef} onPressEnter={save} onBlur={save} />
				</Form.Item>
			) : (
				<div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
					<EditOutlined />
					&nbsp;{children}
				</div>
			);
		}

		return <td {...restProps}>{childNode}</td>;
	};
	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell
		}
	};
	return components;
}

export type QuerySet<T> = {
	result: UseQueryResult<T[], Error>;
	isMutating: boolean;
	handleDelete: Function;
	handleSave: Function;
	createMutation: UseMutationResult<void, Error, any, void>;
};

export function getQueries<APIRow>(apipath: string, querykey: string): QuerySet<APIRow> {
	const queryClient = useQueryClient();
	const { showBoundary } = useErrorBoundary();
	const [isMutating, setIsMutating] = useState(false);
	const result = useQuery({
		queryKey: [querykey],
		queryFn: (): Promise<Array<APIRow>> => {
			return fetch(apipath, FetchResultTypes.JSON);
		},
		throwOnError: true
	});
	const deleteMutation = useMutation({
		mutationFn: async (r: any) => {
			return fetch(
				`${apipath}/${r.key}`,
				{
					method: FetchMethods.Delete
				},
				FetchResultTypes.JSON
			)
				.then((_data) => {
					queryClient.setQueryData([querykey], (old: any) => {
						return old.filter((item: any) => item.key !== r.key);
					});
				})
				.catch((e) => showBoundary(e));
		},
		onMutate: () => {
			setIsMutating(true);
		},
		onSettled: () => {
			setIsMutating(false);
		}
	});
	const handleDelete = (key: React.Key) => {
		deleteMutation.mutate({ key });
	};
	const updateMutation = useMutation({
		mutationFn: async (r: any) => {
			return fetch(
				`${apipath}/${r.key}`,
				{
					method: FetchMethods.Post,
					body: JSON.stringify(r),
					headers: {
						'Content-Type': 'application/json'
					}
				},
				FetchResultTypes.JSON
			)
				.then((data: any) => {
					if (data.status !== 'ok') {
						console.error('Error updating data', data);
						throw new z.ZodError(data.error);
					}
					queryClient.setQueryData([querykey], (old: any) => {
						return old.map((item: any) => {
							if (item.key === r.key) {
								return data.datum;
							}
							return item;
						});
					});
				})
				.catch((e) => showBoundary(e));
		},
		onMutate: () => {
			setIsMutating(true);
		},
		onSettled: () => {
			setIsMutating(false);
		}
	});
	const handleSave = (row: APIRow, form: FormInstance<any>, toggleEdit: Function): Boolean => {
		updateMutation.mutate(row, {
			onError: (e) => {
				try {
					const formatted = (e as z.ZodError).format();
					const f = Object.entries(formatted)
						.filter(([key, _]) => key !== '_errors')
						.map(([key, value]) => {
							return { name: key, errors: (value as any)._errors };
						});
					form.setFields(f);
				} catch (e) {
					showBoundary(e);
				}
			},
			onSuccess: () => {
				toggleEdit();
			}
		});
		return true;
	};
	const createMutation = useMutation({
		mutationFn: async (r: any) => {
			return fetch(
				apipath,
				{
					method: FetchMethods.Post,
					body: JSON.stringify(r),
					headers: {
						'Content-Type': 'application/json'
					}
				},
				FetchResultTypes.JSON
			)
				.then((data: any) => {
					queryClient.setQueryData([querykey], (old: any) => {
						return [...old, data.datum];
					});
				})
				.catch((e) => showBoundary(e));
		},
		onMutate: () => {
			setIsMutating(true);
		},
		onSettled: () => {
			setIsMutating(false);
		}
	});
	return { result, isMutating, handleDelete, handleSave, createMutation };
}

export function AddRow({ createMutation, children }: { createMutation: UseMutationResult<void, Error, any, void>; children: React.ReactNode }) {
	const [amCreating, setCreating] = useState(false);
	if (!amCreating) {
		return (
			<Button onClick={() => setCreating(true)} type="primary" style={{ marginBottom: 16 }}>
				Add a row
			</Button>
		);
	}
	return (
		<Form
			onFinish={(values) => {
				createMutation.mutate(values);
				setCreating(false);
			}}
		>
			<>{children}</>
			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
}

export function getColumns<Item>(columns: ColumnTypeArray, _handleSave: Function) {
	const handleSave: SaveHandler<Item> = _handleSave as SaveHandler<Item>;
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

export function WrapCRUD<Res>({ children, result }: { children: React.ReactNode; result: UseQueryResult<Array<Res>, Error> }) {
	if (result.isLoading) {
		return <Spin size="large" />;
	}
	if (result.isError) {
		return <ErrorFallback error={result.error} />;
	}
	return <>{children}</>;
}

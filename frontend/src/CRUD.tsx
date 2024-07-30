import { createContext, type FC, useState, useContext, useRef, useEffect, type RefObject, type MutableRefObject } from 'react';
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
import { useErrorBoundary, ErrorFallback } from './ErrorFallback';
import { SchemaBundle } from 'common/schema';
import { getZObject } from 'common';
import { createSchemaFieldRule } from 'antd-zod';
import { Store } from 'rc-field-form/lib/interface';
import { SaveOutlined } from '@ant-design/icons';
import { ColProps } from 'antd';
import { FormInstance } from 'antd/es/form';

type InputRef = GetRef<typeof Input>;

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
	(row: Item, form: RefObject<FormInstance<any>>, toggleEdit: Function): Boolean;
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

export function zodErrorConvertor(data: any): Error | undefined {
	if (data.status && data.status !== 'ok' && data.error) {
		console.error('Error updating data', data);
		return new z.ZodError(data.error);
	}
	return;
}

export function zodErrorConvertorThrow(data: any, onSuccess?: () => void) {
	const maybeError = zodErrorConvertor(data);
	if (maybeError) throw maybeError;
	if (onSuccess) onSuccess();
}

export function getCreateMutation(apipath: string, querykey: QueryKey, setIsMutating: (isMutating: boolean) => void, onCreate: (data: any) => void) {
	const { showBoundary } = useErrorBoundary();
	const queryClient = useQueryClient();
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
			).then((data) => {
				queryClient.invalidateQueries({ queryKey: coerceQueryKey(querykey) });
				zodErrorConvertorThrow(data, () => {
					onCreate(data);
				});
			});
		},
		onError: (e) => showBoundary(e),
		onMutate: () => {
			setIsMutating(true);
		},
		onSettled: () => {
			setIsMutating(false);
		}
	});
	return createMutation;
}

type QueryKeyElement = string | number;
export type QueryKey = QueryKeyElement | QueryKeyElement[];

function coerceQueryKey(key: QueryKey): string[] {
	if (typeof key === 'number') {
		// Array.from works on single strings, but not numbers, as they're not iterable
		return [`${key}`];
	}
	return Array.from(key, (v: QueryKeyElement) => `${v}`);
}

export function getFetchQuery<T>(apipath: string, querykey: QueryKey): UseQueryResult<T, Error> {
	return useQuery({
		queryKey: coerceQueryKey(querykey),
		queryFn: (): Promise<T> => {
			return fetch(apipath, FetchResultTypes.JSON);
		},
		throwOnError: true
	});
}

export function getUpdateMutation(
	apipath: string,
	querykey: QueryKey,
	setIsMutating: (isMutating: boolean) => void,
	onSuccess: (data: any, row: any) => void
): UseMutationResult<void, Error, any, void> {
	const { showBoundary } = useErrorBoundary();
	const queryClient = useQueryClient();
	return useMutation({
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
			).then((data) => {
				queryClient.invalidateQueries({ queryKey: coerceQueryKey(querykey) });
				zodErrorConvertorThrow(data, () => {
					onSuccess(data, r);
				});
			});
		},
		onError: (e) => showBoundary(e),
		onMutate: () => {
			setIsMutating(true);
		},
		onSettled: () => {
			setIsMutating(false);
		}
	});
}

export function getDeleteMutation(
	apipath: string,
	setIsMutating: (isMutating: boolean) => void,
	onSuccess: (data: any, row: any) => void
): UseMutationResult<void, Error, any, void> {
	const { showBoundary } = useErrorBoundary();
	return useMutation({
		mutationFn: async (r: any) => {
			return fetch(
				`${apipath}/${r.key}`,
				{
					method: FetchMethods.Delete
				},
				FetchResultTypes.JSON
			)
				.then((data) => {
					onSuccess(data, r);
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
}

export function mutationErrorToFormError(form: FormInstance<any>, e: any) {
	const { showBoundary } = useErrorBoundary();
	try {
		if (e instanceof z.ZodError) {
			const formatted = (e as z.ZodError).format();
			const f = Object.entries(formatted)
				.filter(([key, _]) => key !== '_errors')
				.map(([key, value]) => {
					return { name: key, errors: (value as any)._errors };
				});
			form.setFields(f);
		} else {
			showBoundary(e);
		}
	} catch (e) {
		showBoundary(e);
	}
}

export function getListQueries<APIRow>(apipath: string, querykey: QueryKey): QuerySet<APIRow> {
	const queryClient = useQueryClient();
	const [isMutating, setIsMutating] = useState(false);
	const result = getFetchQuery<Array<APIRow>>(apipath, querykey);
	const deleteMutation = getDeleteMutation(apipath, setIsMutating, (_data) => {
		queryClient.setQueryData(coerceQueryKey(querykey), (old: any, row: any) => {
			return old.filter((item: any) => item.key !== row.key);
		});
	});
	const handleDelete = (key: React.Key) => {
		deleteMutation.mutate({ key });
	};
	const updateMutation = getUpdateMutation(apipath, querykey, setIsMutating, (data: any) => {
		queryClient.setQueryData([querykey], (old: any) => {
			return old.map((item: any, row: any) => {
				if (item.key === row.key) {
					return data.datum;
				}
				return item;
			});
		});
	});
	const handleSave = (row: APIRow, form: FormInstance<any>, toggleEdit: Function): Boolean => {
		updateMutation.mutate(row, {
			onError: (e) => mutationErrorToFormError(form, e),
			onSuccess: () => toggleEdit()
		});
		return true;
	};
	const createMutation = getCreateMutation(apipath, querykey, setIsMutating, (data: any) => {
		queryClient.setQueryData([querykey], (old: any) => {
			return [...(old || []), data.datum];
		});
	});
	return { result, isMutating, handleDelete, handleSave, createMutation };
}

export function CreateForm({
	mutation,
	setIsMutating,
	children,
	initialValues,
	formRef,
	submitButton = true,
	submitButtonText = 'Submit',
	style,
	labelCol = { span: 5 },
	wrapperCol = { span: 19 },
	hidden = false
}: {
	mutation: UseMutationResult<void, Error, any, void>;
	setIsMutating: React.Dispatch<React.SetStateAction<boolean>>;
	children: React.ReactNode;
	initialValues?: Store | undefined;
	formRef: MutableRefObject<FormInstance<any>>;
	submitButton?: boolean;
	submitButtonText?: string;
	style?: React.CSSProperties;
	labelCol?: ColProps;
	wrapperCol?: ColProps;
	hidden?: boolean;
}) {
	const [isSubmittable, setSubmittable] = useState(false);
	const form = formRef.current!;
	const values = Form.useWatch([], form);

	useEffect(() => {
		form.validateFields({})
			.then(() => setSubmittable(true))
			.catch(() => setSubmittable(false));
	}, [form, values]);

	if (hidden) {
		return <></>;
	}
	return (
		<Form
			style={style}
			ref={formRef as RefObject<FormInstance<any>>}
			form={form}
			initialValues={initialValues}
			labelCol={labelCol}
			wrapperCol={wrapperCol}
			onFinish={(values) => {
				mutation.mutate(values, {
					onError: (e) => {
						mutationErrorToFormError(form, e);
					},
					onSuccess: () => setIsMutating(false)
				});
			}}
		>
			<>{children}</>
			{submitButton ? (
				<Form.Item>
					<Button icon={<SaveOutlined />} type="primary" htmlType="submit" disabled={!isSubmittable}>
						{submitButtonText}
					</Button>
				</Form.Item>
			) : (
				<></>
			)}
		</Form>
	);
}

export function AddRow({ createMutation, children }: { createMutation: UseMutationResult<void, Error, any, void>; children: React.ReactNode }) {
	const [isCreating, setIsCreating] = useState(false);
	const [form] = Form.useForm();
	const formRef = useRef<FormInstance<any>>(form);
	let button = <></>;
	if (!isCreating) {
		button = (
			<Button onClick={() => setIsCreating(true)} type="primary" style={{ marginBottom: 16 }}>
				Add a row
			</Button>
		);
	}
	return (
		<>
			${button}${CreateForm({ mutation: createMutation, setIsMutating: setIsCreating, children, formRef })}
		</>
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

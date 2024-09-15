import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { FC, RefObject, useContext, useEffect, useRef, useState } from 'react';
import * as z from 'zod';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';
import Form, { FormInstance } from 'antd/es/form';
import Input from 'antd/es/input';
import { EditOutlined } from '@ant-design/icons';
import { createSchemaFieldRule } from 'antd-zod';

import { EditableCellProps, QueryKey, EditableRowProps, Item, InputRef } from './types';
import { coerceQueryKey, zodErrorConvertorThrow, getEditableContext } from './utils';
import { useErrorBoundary } from '../../components/ErrorBoundary';
import { SchemaBundle } from 'common/schema';

import { getZObject } from 'common';

export function useFetchQuery<T>(apipath: string, querykey: QueryKey): UseQueryResult<T, Error> {
	return useQuery({
		queryKey: coerceQueryKey(querykey),
		queryFn: (): Promise<T> => {
			return fetch(apipath, FetchResultTypes.JSON);
		},
		throwOnError: true
	});
}

export function useCreateMutation(
	apipath: string,
	querykey: QueryKey,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onCreate: (data: any) => void
) {
	const queryClient = useQueryClient();
	const { showBoundary } = useErrorBoundary();
	const [isCreating, setIsMutating] = useState(false);
	const createMutation = useMutation({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		onError: (e) => {
			setIsMutating(false);
			showBoundary(e);
		},
		onMutate: () => {
			setIsMutating(true);
		},
		onSettled: () => {
			setIsMutating(false);
		}
	});
	return { createMutation, isCreating };
}

export function useCreateMutationAndUpdateQueryData(apipath: string, querykey: QueryKey) {
	const queryClient = useQueryClient();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return useCreateMutation(apipath, querykey, (data: any) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		queryClient.setQueryData([querykey], (old: any) => {
			return [...(old || []), data.datum];
		});
	});
}

export function useUpdateMutation(
	apipath: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSuccess: (data: any, row: any) => void
) {
	const [isUpdating, setIsMutating] = useState(false);
	const { showBoundary } = useErrorBoundary();
	const updateMutation = useMutation({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
				zodErrorConvertorThrow(data, () => {
					onSuccess(data, r);
				});
			});
		},
		onMutate: () => {
			setIsMutating(true);
		},
		onSettled: () => {
			setIsMutating(false);
		},
		onError: (e) => {
			setIsMutating(false);
			showBoundary(e);
		}
	});
	return { updateMutation, isUpdating };
}

export function useUpdateMutationAndUpdateQueryData(apipath: string, querykey: QueryKey) {
	const queryClient = useQueryClient();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return useUpdateMutation(apipath, (data: any) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		queryClient.setQueryData([querykey], (old: any) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return old.map((item: any, row: any) => {
				if (item.key === row.key) {
					return data.datum;
				}
				return item;
			});
		});
	});
}

export function useDeleteMutation(
	apipath: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onSuccess: (data: any, row: any) => void
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
) {
	const [isDeleting, setIsMutating] = useState(false);
	const { showBoundary } = useErrorBoundary();
	const deleteMutation = useMutation({
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		},
		onError: (e) => {
			setIsMutating(false);
			throw e;
		}
	});
	return { deleteMutation, isDeleting };
}

export function useDeleteMutationAndUpdateQueryData(apipath: string, querykey: QueryKey) {
	const queryClient = useQueryClient();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return useDeleteMutation(apipath, (row: any) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		queryClient.setQueryData(coerceQueryKey(querykey), (old: any) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return old.filter((item: any) => item.key !== row.key);
		});
	});
}

export function useMutationErrorToFormError() {
	const { showBoundary } = useErrorBoundary();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return function (form: FormInstance<any>, e: any) {
		try {
			if (e instanceof z.ZodError) {
				const formatted = (e as z.ZodError).format();
				const f = Object.entries(formatted)
					.filter(([key, _]) => key !== '_errors')
					.map(([key, value]) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						return { name: key, errors: (value as any)._errors };
					});
				form.setFields(f);
			} else {
				showBoundary(e);
			}
		} catch (e) {
			showBoundary(e);
		}
	};
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useFormHandlers<APIRow>(apipath: string, querykey: QueryKey) {
	const { deleteMutation, isDeleting } = useDeleteMutationAndUpdateQueryData(apipath, querykey);
	const { updateMutation, isUpdating } = useUpdateMutationAndUpdateQueryData(apipath, querykey);
	const mutationErrorToFormError = useMutationErrorToFormError();
	return {
		handleDelete: (key: React.Key) => {
			deleteMutation.mutate({ key });
		},
		isDeleting,
		// eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
		handleUpdate: (row: APIRow, form: RefObject<FormInstance<any>>, toggleEdit: Function): boolean => {
			updateMutation.mutate(row, {
				onError: (e) => mutationErrorToFormError(form.current!, e),
				onSuccess: () => toggleEdit()
			});
			return true;
		},
		isUpdating
	};
}

export function useTableComponents(schema: SchemaBundle) {
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
	return {
		body: {
			row: EditableRow,
			cell: EditableCell
		}
	};
}

import { useMutation, useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { FC, RefObject, useContext, useEffect, useRef, useState } from 'react';
import * as z from 'zod';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';
import Form, { FormInstance } from 'antd/es/form';
import Input from 'antd/es/input';
import { EditOutlined } from '@ant-design/icons';
import { createSchemaFieldRule } from 'antd-zod';

import { EditableCellProps, QueryKey, EditableRowProps, Item, InputRef, Keyable, MutationReturn, DeleteReturn } from './types';
import { coerceQueryKey, zodErrorConvertorThrow, getEditableContext } from './utils';
import { useErrorBoundary } from '../../components/ErrorBoundary';
import { SchemaBundle } from 'common/schema';

import { getZObject } from 'common';

export function useFetchQuery<T>(apipath: string, querykey: QueryKey): UseQueryResult<T> {
    return useQuery({
        queryKey: coerceQueryKey(querykey),
        queryFn: (): Promise<T> => {
            return fetch(apipath, FetchResultTypes.JSON);
        },
        throwOnError: true
    });
}

export function useCreateMutation<TIn, TCreated extends Keyable>(
    apipath: string,
    querykey: QueryKey,
    onCreate: (data: MutationReturn<TCreated>) => void
) {
    const queryClient = useQueryClient();
    const { showBoundary } = useErrorBoundary();
    const [isCreating, setIsMutating] = useState(false);
    const createMutation = useMutation<MutationReturn<TCreated>, Error, TIn, TIn>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: async (r: TIn) => {
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
                void queryClient.invalidateQueries({ queryKey: coerceQueryKey(querykey) });
                zodErrorConvertorThrow(data, () => {
                    onCreate(data as MutationReturn<TCreated>);
                });
                return data as MutationReturn<TCreated>;
            });
        },
        onError: (e) => {
            setIsMutating(false);
            showBoundary(e);
        },
        onMutate: () => {
            setIsMutating(true);
            return undefined;
        },
        onSettled: () => {
            setIsMutating(false);
        }
    });
    return { createMutation, isCreating };
}

export function useCreateMutationAndUpdateQueryData<TIn, TCreated extends Keyable>(apipath: string, querykey: QueryKey) {
    const queryClient = useQueryClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useCreateMutation<TIn, TCreated>(apipath, querykey, (data: MutationReturn<TCreated>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData<TCreated[]>([querykey], (old: TCreated[] | undefined) => {
            return [...(old ?? []), data.datum] as TCreated[];
        });
    });
}

export function useUpdateMutation<T extends Keyable>(
    apipath: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: MutationReturn<T>, row: T) => void
) {
    const [isUpdating, setIsMutating] = useState(false);
    const { showBoundary } = useErrorBoundary();
    const updateMutation = useMutation<MutationReturn<T>, Error, T, T>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: async (r: T) => {
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
                    onSuccess(data as MutationReturn<T>, r);
                });
                return data as MutationReturn<T>;
            });
        },
        onMutate: () => {
            setIsMutating(true);
            return undefined
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

export function useUpdateMutationAndUpdateQueryData<T extends Keyable>(apipath: string, querykey: QueryKey) {
    const queryClient = useQueryClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useUpdateMutation<T>(apipath, (data: MutationReturn<T>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData([querykey], (old?: T[]) => {
        if (!old) return [data.datum];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return old.map((item: T) => {
                if (item.key === data.datum.key) {
                    return data.datum;
                }
                return item;
            });
        });
    });
}

export function useDeleteMutation<T extends Keyable>(
    apipath: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: DeleteReturn<T>, row: T) => void
     
) {
    const [isDeleting, setIsMutating] = useState(false);
    const { showBoundary } = useErrorBoundary();
    const deleteMutation = useMutation<DeleteReturn<T>, Error, T>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mutationFn: async (r: T) => {
            return fetch(
                `${apipath}/${r.key}`,
                {
                    method: FetchMethods.Delete
                },
                FetchResultTypes.JSON
            )
                .then((data) => {
                    onSuccess(data as DeleteReturn<T>, r);
                    return data as DeleteReturn<T>;
                })
                .catch((e: unknown) => {
                    showBoundary(e); 
                    return {} as DeleteReturn<T>;
                });
        },
        onMutate: () => {
            setIsMutating(true);
            return undefined;
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

export function useDeleteMutationAndUpdateQueryData<T extends Keyable>(apipath: string, querykey: QueryKey) {
    const queryClient = useQueryClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return useDeleteMutation(apipath, (row: DeleteReturn<T>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData<T[]>(coerceQueryKey(querykey), (old: T[] | undefined) => {
            if (!old) return [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return old.filter((item: T) => item.key !== row.datum.key);
        });
    });
}

export function useMutationErrorToFormError() {
    const { showBoundary } = useErrorBoundary();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function (form: FormInstance, e: any) {
        try {
            if (e instanceof z.ZodError) {
                const formatted = (e).format();
                const f = Object.entries(formatted)
                    .filter(([key, _]) => key !== '_errors')
                    .map(([key, errors]) => {
                        return { name: key, errors };
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

export function useFormHandlers(apipath: string, querykey: QueryKey) {
    const { deleteMutation, isDeleting } = useDeleteMutationAndUpdateQueryData(apipath, querykey);
    const { updateMutation, isUpdating } = useUpdateMutationAndUpdateQueryData(apipath, querykey);
    const mutationErrorToFormError = useMutationErrorToFormError();
    const f = {
        handleDelete: (key: Keyable['key']) => {
            deleteMutation.mutate({ key });
        },
        isDeleting,
        handleUpdate: (row: Keyable, form: RefObject<FormInstance>, toggleEdit: () => void): boolean => {
            updateMutation.mutate(row, {
                onError: (e) => { mutationErrorToFormError(form.current!, e); },
                onSuccess: () => { toggleEdit(); }
            });
            return true;
        },
        isUpdating
    };
    return f
}

// eslint-disable-next-line @eslint-react/hooks-extra/no-redundant-custom-hook
export function useTableComponents(schema: SchemaBundle) {
    const formRule = createSchemaFieldRule(getZObject(schema.update ?? schema.read));
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const EditableContext = getEditableContext();
    // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps<Item> & {handleUpdate?: unknown}>> = ({
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        // Pull this out to stop React shouting at us
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
        handleUpdate,
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

        const save = () => { void (async () => {
            try {
                const values = await form.validateFields() as Item;
                handleSave({ ...record, ...values }, form, toggleEdit);
            } catch (errInfo) {
                console.log('Save failed:', errInfo);
            }
        })() };

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

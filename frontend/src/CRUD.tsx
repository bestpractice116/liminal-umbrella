import { createContext, type FC, useState, useContext, useRef, useEffect } from 'react';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch'
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import type  { GetRef } from 'antd/es/_util/type';
import Input from 'antd/es/input';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import * as z from 'zod';
import { RuleRender } from 'rc-field-form/es/interface.js'
import { useErrorBoundary } from './ErrorFallback';


type InputRef = GetRef<typeof Input>
export type FormInstance<T> = GetRef<typeof Form<T>>;

interface EditableCellProps<T> {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof T;
    record: T;
    handleSave: (record: T, form: FormInstance<any>, _: Function) => void;
}

type EditableTableProps = Parameters<typeof Table>[0];
export type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

export interface DataType {
    key: React.Key;
    name: string;
}

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

export function getEditables(formRule: RuleRender) {
    const EditableContext = getEditableContext()
    const EditableRow: FC<EditableRowProps> = ({index, ...props}) => {
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

            console.log("Calling handleSave")
            handleSave({ ...record, ...values }, form, toggleEdit)
          } catch (errInfo) {
            console.log('Save failed:', errInfo);
          }
        };

        let childNode = children;

        if (editable) {
          childNode = editing ? (
            <Form.Item
              style={{ margin: 0 }}
              name={dataIndex}
              rules={[formRule]}
            >
              <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
          ) : (
            <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
              {children}
            </div>
          );
        }

        return <td {...restProps}>{childNode}</td>;
    };
    return {
        EditableRow,
        EditableCell
    }
}

export function getQueries<ListResponse>(apipath: string, querykey: string) {
    const queryClient = useQueryClient();
    const { showBoundary } = useErrorBoundary();
    const [isMutating, setIsMutating] = useState(false);
    const result = useQuery({
        queryKey: [querykey],
        queryFn: (): Promise<ListResponse> => {
            return fetch(apipath, FetchResultTypes.JSON);
        },
        throwOnError: true,
    });
    const deleteMutation = useMutation({
        mutationFn: async (r: any) => {
          return fetch(`${apipath}/${r.key}`, {
            method: FetchMethods.Delete
          }, FetchResultTypes.JSON).then(_data => {
            queryClient.setQueryData([querykey], (old: any) => {
              return old.filter((item: any) => item.key !== r.key)
            })
          }).catch((e) => showBoundary(e))
        },
        onMutate: () => {
          setIsMutating(true);
        },
        onSettled: () => {
          setIsMutating(false);
        },
    })
    const updateMutation = useMutation({
        mutationFn: async (r: any) => {
          return fetch(`${apipath}/${r.key}`, {
            method: FetchMethods.Post,
            body: JSON.stringify(r),
            headers: {
              'Content-Type': 'application/json'
            },
            },FetchResultTypes.JSON
          ).then((data: any) => {
            if (data.status !== "ok") {
              console.error("Error updating data", data)
              throw(new z.ZodError(data.error))
            }
            queryClient.setQueryData([querykey], (old: any) => {
              return old.map((item: any) => {
                if (item.key === r.key) {
                  return data.datum;
                }
                return item;
              })
            })
          }).catch((e) => showBoundary(e))
        },
        onMutate: () => {
          setIsMutating(true);
        },
        onSettled: () => {
          setIsMutating(false);
        },
    })
    const createMutation = useMutation({
        mutationFn: async (r: any) => {
          return fetch(`/api/botplaying`, {
            method: FetchMethods.Post,
            body: JSON.stringify(r),
            headers: {
              'Content-Type': 'application/json'
            }
          }, FetchResultTypes.JSON).then((data:any) => {
            queryClient.setQueryData(['bot_playing'], (old: any) => {
              return [...old, data.datum]
            })
          }).catch((e) => showBoundary(e))
        },
        onMutate: () => {
          setIsMutating(true);
        },
        onSettled: () => {
          setIsMutating(false);
        },
    })
    return { result, isMutating, deleteMutation, updateMutation, createMutation }
}
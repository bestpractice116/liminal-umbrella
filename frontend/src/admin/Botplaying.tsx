import {createContext, useState, useEffect, useRef, useContext} from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import Button from 'antd/es/button';
import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Spin from 'antd/es/spin';
import Popconfirm from 'antd/es/popconfirm';
import type  { GetRef } from 'antd/es/_util/type';
import * as z from 'zod';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch'
import { ActivitySchema, ActivityType } from 'common/schema';
import { useErrorBoundary } from '../ErrorFallback';

type InputRef = GetRef<typeof Input>

interface FetchBotActivityListResponse {
  playing: { key: number, name: string, type: ActivityType }[];
}

type CreateFieldType = {
  name?: string;
};

type FormInstance<T> = GetRef<typeof Form<T>>;

const EditableContext = createContext<FormInstance<any> | null>(null);

interface EditableRowProps {
  index: number;
}

interface Item {
  key: string;
  name: string;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item, form: FormInstance<any>, _: Function) => void;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
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
        rules={[ActivitySchema.formRule]}
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

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  name: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

async function fetchBotActivityList(): Promise<FetchBotActivityListResponse> {
  return fetch('/api/botplaying', FetchResultTypes.JSON);
}

export default function AdminBotPlaying() {
  const { showBoundary } = useErrorBoundary();
  const queryClient = useQueryClient();
  const result = useQuery({ queryKey: ['bot_playing'], queryFn: fetchBotActivityList, throwOnError: true});
  const deleteMutation = useMutation({
    mutationFn: async (r: any) => {
      return fetch(`/api/botplaying/${r.key}`, {
        method: FetchMethods.Delete
      }, FetchResultTypes.JSON).then(_data => {
        queryClient.setQueryData(['bot_playing'], (old: any) => {
          return {
            playing: old.playing.filter((item: any) => item.key !== r.key)
          };
        })
      }).catch((e) => showBoundary(e))
  }})
  const updateMutation = useMutation({
    mutationFn: async (r: any) => {
      console.log(`R UPDATE /api/botplaying/${r.key} BODY:`, r)
      return fetch(`/api/botplaying/${r.key}`, {
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
        console.log("DATA", data)
        queryClient.setQueryData(['bot_playing'], (old: any) => {
          const x = {
            playing: old.playing.map((item: any) => {
              console.log("ITEM", item, r.key, item.key === r.key)
              if (item.key === r.key) {
                return data.activity;
              }
              return item;
            })
          };
          console.log("SET QUERY DATA", x)
          return x;
        })
      }).catch((e) => showBoundary(e))
    }
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
          return {
            playing: [...old.playing, data.activity]
          };
        })
      }).catch((e) => showBoundary(e))
  }})

  if (result.isLoading) {
    return <Spin size="large" />
  }
  if (result.isError) {
    return <div>Error: {result.error.toString()}</div>;
  }

  const handleDelete = (key: React.Key) => {
    deleteMutation.mutate({ key });
  };

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) =>
          dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];

  const handleSave = (row: DataType, _form: FormInstance<any>, toggleEdit: Function): Boolean => {
      console.log('calling update mutation, have form', _form)
      updateMutation.mutate({...row, type: 'playing'}, {
        onError: (e) => {
          try {
          console.log("HERE", e);
          const formatted = (e as z.ZodError).format();
          const f = Object.entries(formatted)
          .filter(([key, _]) => key !== '_errors')
          .map(([key, value]) => {return {name: key, errors: (value as any)._errors}});
          console.log('setting fields', f)
          _form.setFields(f)
          } catch (e) {showBoundary(e)}
        },
        onSuccess: () => {
          toggleEdit();
        }
      });
      console.log('finished update mutation')
      return true
  };

  const columns = defaultColumns!.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const dataSource: DataType[] = result.data!.playing;

  const AddRow = () => {
    const [amCreating, setCreating] = useState(false)
    if (!amCreating) {
      return <Button onClick={() => setCreating(true)} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button>
    }
    return <Form onFinish={(values) => {
      createMutation.mutate({name: values.name, type: 'playing'})
      setCreating(false)
    }}>
      <Form.Item<CreateFieldType>
        label="Name"
        name="name"
        rules={[ActivitySchema.formRule]}
      >
        <Input />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  }

  return <div>
    <AddRow />
    <Table
      components={components}
      rowClassName={() => 'editable-row'}
      bordered
      dataSource={dataSource}
      columns={columns as ColumnTypes}
    />
  </div>
}

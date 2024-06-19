import {createContext, useState, useEffect, useRef, useContext} from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Table, Form, Input, Button, Popconfirm,  } from 'antd';
import type { GetRef, InputRef,  } from 'antd';
import { createSchemaFieldRule } from 'antd-zod';
import * as z from 'zod';

export enum ActivityType {
  Playing = 'playing',
  Steaming = 'streaming',
  Listening = 'listening',
  Watching = 'watching',
}

export const createSchema = z.object({
  name: z.string({
      required_error: "Name is required",
      invalid_type_error: "Name must be a string",
  }).trim().min(2, { message: "Name must be at least 2 characters long"
  }).max(100, { message: "Name must be less than 100 characters"
  }),
  type: z.nativeEnum(ActivityType),
});

export const deleteSchema = z.object({
  key: z.coerce.number().int().positive(),
});

export const updateSchema = createSchema.merge(deleteSchema);

const rule = createSchemaFieldRule(updateSchema);


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
        rules={[rule]}
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

function fetchBotActivityList() {
  return fetch('/api/botplaying').then(data => data.json());
}


export default function AdminBotPlaying() {
  const queryClient = useQueryClient();
  const result = useQuery({ queryKey: ['bot_playing'], queryFn: fetchBotActivityList, throwOnError: true});

  const deleteMutation = useMutation({
    mutationFn: async (r: any) => {
      return fetch(`/api/botplaying/${r.key}`, {
        method: 'DELETE',
      }).then(res => res.json()).then(_data => {
        queryClient.setQueryData(['bot_playing'], (old: any) => {
          return {
            playing: old.playing.filter((item: any) => item.key !== r.key)
          };
        })
      })
  }})
  const updateMutation = useMutation({
    mutationFn: async (r: any) => {
      console.log(`R UPDATE /api/botplaying/${r.key} BODY:`, r)
      return fetch(`/api/botplaying/${r.key}`, {
        method: 'POST',
        body: JSON.stringify(r),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(data => {
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
      })
    }
  })
  const createMutation = useMutation({
    mutationFn: async (r: any) => {
      return fetch(`/api/botplaying`, {
        method: 'POST',
        body: JSON.stringify(r),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(res => res.json()).then(data => {
        queryClient.setQueryData(['bot_playing'], (old: any) => {
          return {
            playing: [...old.playing, data.activity]
          };
        })
      })
  }})

  if (result.isLoading) {
    return <div>Loading...</div>;
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
          console.log("HERE", e);
          const formatted = (e as z.ZodError).format();
          const f = Object.entries(formatted)
          .filter(([key, _]) => key !== '_errors')
          .map(([key, value]) => {return {name: key, errors: (value as any)._errors}});
          console.log('setting fields', f)
          _form.setFields(
            f
          )
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

  const dataSource: DataType[] = result.data.playing;

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
        rules={[rule]}
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

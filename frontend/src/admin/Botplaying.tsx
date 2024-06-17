import {createContext, useState, useEffect, useRef, useContext} from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { Space, Table, Form, Input, Button, Popconfirm } from 'antd';
import type { TableProps, GetRef, InputRef } from 'antd';

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
  handleSave: (record: Item) => void;
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

      toggleEdit();
      handleSave({ ...record, ...values });
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
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
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


function doEdit(id: string) {
  return () => {
    console.log('edit', id);
  };
}

function doDelete(id: string) {
  return () => {
    console.log('delete', id);
  };
}

function fetchBotActivityList() {
  return fetch('/api/botplaying').then(data => data.json());
}

function formatData(data: any) {
  return data.playing.map((res: any) => ({ key: res.id, name: res.name }));
}

export default function AdminBotPlaying() {
  const queryClient = useQueryClient();
  const result = useQuery({ queryKey: ['bot_playing'], queryFn: fetchBotActivityList });

  const deleteMutation = useMutation({
    mutationFn: async (r: any) => {
      console.log('delete', r);
      await fetch(`/api/botplaying/${r.key}`, {
        method: 'DELETE',
      }).then(res => res.json());
      console.log("CALING DELETE MUTATION SET QUERY")
      queryClient.setQueryData(['bot_playing'], (old: any) => {
        console.log("OLD ", old)
        const nu = {playing: old.playing.filter((item: any) => {
          console.log('DELETE MUT item', item, r.key, item.id !== r.key)
          return item.id !== r.key
        })}
        console.log("NEW ", nu)
        return nu;
      });
      console.log("MMOOOO");
    }
  });

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
    //const defaultColumns: TableProps<Item>['columns'] = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (text) => <a>{text}</a>,
      },
      /*{
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          console.log('rec', record),
          <Space size="middle">
            <a onClick={doEdit(record.key)}>Edit</a>
            <a onClick={doDelete(record.key)}>Delete</a>
          </Space>
        ),
      },*/
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

  const handleSave = (row: DataType) => {
    const index = dataSource.findIndex((item) => row.key === item.key);
    const item = dataSource[index];
    dataSource.splice(index, 1, {
      ...item,
      ...row,
    });
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  console.log(result);
  const dataSource: DataType[] = formatData(result.data);
  let count = dataSource.length;
  const handleAdd = () => {
    const newData: DataType = {
      key: count,
      name: `Edward King ${count}`,
    };
    dataSource.push(newData);
    count = count + 1;
  };
  return <div>
  <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
    Add a row
  </Button>
  <Table
    components={components}
    rowClassName={() => 'editable-row'}
    bordered
    dataSource={dataSource}
    columns={columns as ColumnTypes}
  />
</div>
}

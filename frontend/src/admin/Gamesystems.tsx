import {useState} from 'react';
import Button from 'antd/es/button';
import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Spin from 'antd/es/spin';
import Popconfirm from 'antd/es/popconfirm';
import { GameSystemSchema } from 'common/schema';
import { ErrorFallback } from '../ErrorFallback';
import { getComponents, ColumnTypes, getQueries } from '../CRUD.js';

interface GameSystemListItem { key: number, name: string, description: string }

type CreateFieldType = {
  name?: string
  description?: string
};


const components = getComponents(GameSystemSchema.formRule);

export default function AdminGameSystems() {
  const { result, isMutating, handleDelete, handleSave, createMutation } = getQueries<Array<GameSystemListItem>>('/api/gamesystem', 'gamesystem')

  if (result.isLoading) {
    return <Spin size="large" />
  }
  if (result.isError) {
    return <ErrorFallback error={result.error} />;
  }

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        editable: true,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) =>
          result.data!.length >= 1 ? (
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
      onCell: (record: GameSystemListItem) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const AddRow = () => {
    const [amCreating, setCreating] = useState(false)
    if (!amCreating) {
      return <Button onClick={() => setCreating(true)} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button>
    }
    return <Form onFinish={(values) => {
      createMutation.mutate({name: values.name, description: values.description})
      setCreating(false)
    }}>
      <Form.Item<CreateFieldType>
        label="Name"
        name="name"
        rules={[GameSystemSchema.formRule]}
      >
        <Input />
      </Form.Item>
      <Form.Item<CreateFieldType>
        label="Description"
        name="description"
        rules={[GameSystemSchema.formRule]}
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
    <Spin spinning={isMutating} fullscreen />
    <AddRow />
    <Table
      components={components}
      rowClassName={() => 'editable-row'}
      bordered
      dataSource={result.data!}
      columns={columns as ColumnTypes}
    />
  </div>
}

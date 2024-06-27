import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Spin from 'antd/es/spin';
import Popconfirm from 'antd/es/popconfirm';
import { GameSystemSchema } from 'common/schema';
import { getComponents, ColumnTypes, getQueries, AddRow, ColumnTypeArray, WrapCRUD } from '../CRUD.js';

interface GameSystemListItem { key: number, name: string, description: string }

const components = getComponents(GameSystemSchema.formRule);

export default function AdminGameSystems() {
  const { result, isMutating, handleDelete, handleSave, createMutation } = getQueries<GameSystemListItem>('/api/gamesystem', 'gamesystem')

  const defaultColumns: ColumnTypeArray = [
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

  const columns = defaultColumns.map((col) => {
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

  return <WrapCRUD<GameSystemListItem> result={result}>
    <>
      <Spin spinning={isMutating} fullscreen />
      <AddRow createMutation={createMutation}>
        <Form.Item
            label="Name"
            name="name"
            rules={[GameSystemSchema.formRule]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[GameSystemSchema.formRule]}
          >
            <Input />
          </Form.Item>
        </AddRow>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={result.data!}
        columns={columns as ColumnTypes}
      />
    </>
  </WrapCRUD>
}

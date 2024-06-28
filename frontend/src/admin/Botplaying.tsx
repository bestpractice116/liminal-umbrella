import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Spin from 'antd/es/spin';
import Popconfirm from 'antd/es/popconfirm';
import { DeleteOutlined } from '@ant-design/icons';
import { ActivitySchema, ActivityType } from 'common/schema';
import { getComponents, ColumnTypes, getQueries, AddRow, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';

interface FetchBotActivityItem { key: number, name: string, type: ActivityType }

const components = getComponents(ActivitySchema.formRule);

export default function AdminBotPlaying() {
  const { result, isMutating, handleDelete, handleSave, createMutation } = getQueries<FetchBotActivityItem>('/api/botplaying', 'bot_playing')

  const defaultColumns: DefaultColumns = [
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
          result.data!.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <DeleteOutlined />&nbsp;<a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];

  const columns = getColumns<FetchBotActivityItem>(defaultColumns, handleSave);

  return <WrapCRUD<FetchBotActivityItem> result={result}>
    <>
      <Spin spinning={isMutating} fullscreen />
      <AddRow createMutation={createMutation}>
        <Form.Item
          label="Name"
          name="name"
          rules={[ActivitySchema.formRule]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="type"
          initialValue="playing"
        >
          <Input type="hidden" />
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

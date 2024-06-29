import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Spin from 'antd/es/spin';
import Popconfirm from 'antd/es/popconfirm';
import Divider from 'antd/es/divider';
import { WarningOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';
import { GameSystemSchema } from 'common/schema';
import { getZObject } from 'common'
import { getTableComponents, ColumnTypes, getQueries, AddRow, ColumnTypeArray, WrapCRUD } from '../CRUD.js';
import * as z from 'zod';
import { createSchemaFieldRule } from 'antd-zod';

type GameSystemListItem = z.infer<typeof GameSystemSchema.read>

const components = getTableComponents(GameSystemSchema);
const createFormRule = createSchemaFieldRule(getZObject(GameSystemSchema.create!))
export default function AdminGameSystems() {
  const { result, isMutating, handleDelete, handleSave, createMutation } = getQueries<GameSystemListItem>('/api/gamesystem', 'gamesystem')

  const defaultColumns: ColumnTypeArray = [
      {
        title: 'Name',
        dataIndex: 'name',
        editable: true,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) =>
          result.data!.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <a><DeleteOutlined />&nbsp;Delete</a>
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
      <div>
        This page is for editing the game which DMs can list their games as in Discord
        Please be careful here and do not delete any system which currently has games running or scheduled using it.
        <br /><WarningOutlined />TODO: Add details about what fields are safe to edit - name no and description yes?
        <br /><WarningOutlined />TODO: This list of systems is not currently in use right now - it will be part of the game listing feature
        <br /><WarningOutlined />TODO: We probably need to keep this list at 25 entries or less as Discord drop downs have a 25 entry limit.
          So we can only support that many systems without sub-categories etc. <b>This limit is not enforced currently</b>
      </div>
      <Divider />
      <AddRow createMutation={createMutation}>
        <Form.Item
            label="Name"
            name="name"
            rules={[createFormRule]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
            rules={[createFormRule]}
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

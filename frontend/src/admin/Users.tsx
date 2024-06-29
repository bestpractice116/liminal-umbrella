import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Divider from 'antd/es/divider'
import { getTableComponents, ColumnTypes, getQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';
import { UserSchema } from 'common/schema';


interface FetchUserItem { key: number, name: string }

const formRule = UserSchema.formRule
const components = getTableComponents(formRule);

export default function AdminUsers() {
  const { result, isMutating, handleSave } = getQueries<FetchUserItem>('/api/user', 'user')

  const defaultColumns: DefaultColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        editable: false,
      },
    ];

  const columns = getColumns<FetchUserItem>(defaultColumns, handleSave);

  return <WrapCRUD<FetchUserItem> result={result}>
    <>
      <Spin spinning={isMutating} fullscreen />
      <div>
        This page is for Users
      </div>
      <Divider />

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

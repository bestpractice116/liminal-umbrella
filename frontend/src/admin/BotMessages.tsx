import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import { BotMessageSchema } from 'common/schema';
import { getComponents, ColumnTypes, getQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';

interface FetchBotMessageItem { key: number, name: string, value: string }

const components = getComponents(BotMessageSchema.formRule);

export default function AdminBotMessages() {
  const { result, isMutating, handleSave } = getQueries<FetchBotMessageItem>('/api/botmessages', 'botmessages')

  const defaultColumns: DefaultColumns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        editable: false,
      },
      {
        title: 'Message',
        dataIndex: 'value',
        key: 'value',
        editable: true,
      },
    ];

  const columns = getColumns<FetchBotMessageItem>(defaultColumns, handleSave);

  return <WrapCRUD<FetchBotMessageItem> result={result}>
    <>
      <Spin spinning={isMutating} fullscreen />
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

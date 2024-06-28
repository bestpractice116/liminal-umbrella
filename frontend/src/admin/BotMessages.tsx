import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Result from 'antd/es/result';
import Divider from 'antd/es/divider';
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

  const codeexample = '${this....}'
  const leftBracket = '${'
  const rightBracket = '}'
  return <WrapCRUD<FetchBotMessageItem> result={result}>
    <>
      <Spin spinning={isMutating} fullscreen />
      <Result
        status="warning"
        title="Danger - Altering these templates can break the bot."
        extra={<>The interpolations (things contained inside <code>{codeexample}</code>) are references
        to specific things inside the bot code. <b>Do not</b>change or edit them unless you know what you are doing.
        Unbalanced brackets (<code>{leftBracket}</code> without the <code>{rightBracket}</code>) will cause errors.</>}
      />
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

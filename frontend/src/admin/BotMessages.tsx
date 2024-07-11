import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Result from 'antd/es/result';
import Divider from 'antd/es/divider';
import { BotMessageSchema, type BotMessageListItem } from 'common/schema';
import { getTableComponents, ColumnTypes, getListQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';

const components = getTableComponents(BotMessageSchema);

export default function AdminBotMessages() {
	const { result, isMutating, handleSave } = getListQueries<BotMessageListItem>('/api/botmessages', 'botmessages');

	const defaultColumns: DefaultColumns = [
		{
			title: 'Name',
			dataIndex: 'name',
			editable: false
		},
		{
			title: 'Message',
			dataIndex: 'value',
			editable: true
		}
	];

	const columns = getColumns<BotMessageListItem>(defaultColumns, handleSave);

	const codeexample = '${this....}';
	const leftBracket = '${';
	const rightBracket = '}';
	return (
		<WrapCRUD<BotMessageListItem> result={result}>
			<>
				<Spin spinning={isMutating} fullscreen />
				<Result
					status="warning"
					title="Danger - Altering these templates can break the bot."
					extra={
						<>
							The interpolations (things contained inside <code>{codeexample}</code>) are references to specific things inside the bot
							code. <b>Do not</b>change or edit them unless you know what you are doing. Unbalanced brackets (<code>{leftBracket}</code>{' '}
							without the <code>{rightBracket}</code>) will cause errors.
						</>
					}
				/>
				<Divider />
				<div>
					This page is for editing the messages which the bot can send into Discord. Any changes made here will be reflected in the bot's
					behavior.
				</div>
				<Table
					components={components}
					rowClassName={() => 'editable-row'}
					bordered
					dataSource={result.data!}
					columns={columns as ColumnTypes}
				/>
			</>
		</WrapCRUD>
	);
}

import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Spin from 'antd/es/spin';
import Popconfirm from 'antd/es/popconfirm';
import Divider from 'antd/es/divider';
import { DeleteOutlined } from '@ant-design/icons';
import { ActivitySchema, type BotActivityListItem } from 'common/schema';
import { getZObject } from 'common';
import { createSchemaFieldRule } from 'antd-zod';
import { getTableComponents, ColumnTypes, getListQueries, AddRow, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';

const components = getTableComponents(ActivitySchema);
const createFormRule = createSchemaFieldRule(getZObject(ActivitySchema.create!));

export default function AdminBotPlaying() {
	const { result, isMutating, handleDelete, handleSave, createMutation } = getListQueries<BotActivityListItem>('/api/botplaying', 'bot_playing');

	const defaultColumns: DefaultColumns = [
		{
			title: 'Name',
			dataIndex: 'name',
			editable: true
		},
		{
			title: 'operation',
			dataIndex: 'operation',
			render: (_, record) =>
				result.data!.length >= 1 ? (
					<Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
						<DeleteOutlined />
						&nbsp;<a>Delete</a>
					</Popconfirm>
				) : null
		}
	];

	const columns = getColumns<BotActivityListItem>(defaultColumns, handleSave);

	return (
		<WrapCRUD<BotActivityListItem> result={result}>
			<>
				<Spin spinning={isMutating} fullscreen />
				<div>
					This page is for editing the games which the bot can be listed as '<code>Playing ...</code>' in the user list at the side of
					Discord. The bot will randomly pick a new activity from this list roughly every 4 hours (although this will vary!). The list here
					is not used anywhere else in the bot, and so it's safe to add or remove items as you see fit and you can add items which are not
					TTRPGs (e.g. <code>with kittens</code>)
				</div>
				<Divider />
				<AddRow createMutation={createMutation}>
					<Form.Item label="Name" name="name" rules={[createFormRule]}>
						<Input />
					</Form.Item>
					<Form.Item name="type" initialValue="playing">
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
	);
}

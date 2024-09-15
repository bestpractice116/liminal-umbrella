import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Popconfirm from 'antd/es/popconfirm';
import Divider from 'antd/es/divider';
import { WarningOutlined } from '@ant-design/icons';
import { DeleteOutlined } from '@ant-design/icons';
import { GameSystemSchema, type GameSystemListItem } from 'common/schema';
import { getZObject } from 'common';
import { getTableComponents, ColumnTypes, getListQueries, AddRow, ColumnTypeArray, WrapCRUD } from '../../lib/CRUD.js';
import { createSchemaFieldRule } from 'antd-zod';

const components = getTableComponents(GameSystemSchema);
const createFormRule = createSchemaFieldRule(getZObject(GameSystemSchema.create!));
export function AdminGameSystems() {
	const { result, isMutating, handleDelete, handleSave, createMutation } = getListQueries<GameSystemListItem>('/api/gamesystem', 'gamesystem');

	const defaultColumns: ColumnTypeArray = [
		{
			title: 'Name',
			dataIndex: 'name',
			editable: true,
			ellipsis: true
		},
		{
			title: 'Description',
			dataIndex: 'description',
			editable: true,
			ellipsis: true
		},
		{
			title: 'Tag',
			dataIndex: 'tag',
			editable: true,
			ellipsis: true
		},
		{
			title: 'operation',
			dataIndex: 'operation',
			ellipsis: true,
			render: (_, record) =>
				result.data!.length >= 1 ? (
					<Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
						<a>
							<DeleteOutlined />
							&nbsp;Delete
						</a>
					</Popconfirm>
				) : null
		}
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
				handleSave
			})
		};
	});

	return (
		<WrapCRUD<GameSystemListItem> spin={isMutating} result={result}>
			<>
				<div>
					This page is for editing the game which DMs can list their games as in Discord Please be careful here and do not delete any system
					which currently has games running or scheduled using it.
					<br />
					<WarningOutlined />
					TODO: Add details about what fields are safe to edit - name no and description yes?
					<br />
					<WarningOutlined />
					TODO: We probably need to keep this list at 25 entries or less as Discord drop downs have a 25 entry limit. So we can only support
					that many systems without sub-categories etc. <b>This limit is not enforced currently</b>
				</div>
				<Divider />
				<AddRow createMutation={createMutation}>
					<Form.Item label="Name" name="name" rules={[createFormRule]}>
						<Input />
					</Form.Item>
					<Form.Item label="Description" name="description" rules={[createFormRule]}>
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
	);
}

import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Divider from 'antd/es/divider';
import { getTableComponents, ColumnTypes, getQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';
import { RoleSchema } from 'common/schema';
import * as z from 'zod';

type RoleListItem = z.infer<typeof RoleSchema.read>;

const components = getTableComponents(RoleSchema);

export default function AdminRoles() {
	const { result, isMutating, handleSave } = getQueries<RoleListItem>('/api/role', 'role');

	const defaultColumns: DefaultColumns = [
		{
			title: 'Name',
			dataIndex: 'name',
			editable: false
		},
		{
			title: 'Mentionable',
			dataIndex: 'mentionable',
			editable: false,
			render: (mentionable: boolean) => (mentionable ? 'Yes' : 'No')
		}
	];

	const columns = getColumns<RoleListItem>(defaultColumns, handleSave);
	return (
		<WrapCRUD<RoleListItem> result={result}>
			<>
				<Spin spinning={isMutating} fullscreen />
				<div>This page is for Roles</div>
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
	);
}

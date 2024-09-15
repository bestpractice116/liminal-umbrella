import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import { getTableComponents, ColumnTypes, getListQueries, getColumns, DefaultColumns, WrapCRUD } from '../../lib/CRUD.js';
import { RoleSchema, type RoleListItem } from 'common/schema';

const components = getTableComponents(RoleSchema);

export function AdminRoles() {
	const { result, isMutating, handleSave } = getListQueries<RoleListItem>('/api/role', 'role');

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

import Table from 'antd/es/table';
import { Spin } from '../../components/Spin';
import { useTableComponents, useFormHandlers, useFetchQuery, ColumnTypes, getColumns, DefaultColumns, WrapCRUD } from '../../lib/CRUD';
import { RoleSchema, type RoleListItem } from 'common/schema';

export function AdminRoles() {
	const result = useFetchQuery<RoleListItem[]>('/api/role', 'role');
	const { isUpdating, handleUpdate } = useFormHandlers<RoleListItem>('/api/role', 'role');
	const components = useTableComponents(RoleSchema);

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

	const columns = getColumns<RoleListItem>(defaultColumns, handleUpdate);
	return (
		<WrapCRUD<RoleListItem> result={result}>
			<>
				<Spin spinning={isUpdating} />
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

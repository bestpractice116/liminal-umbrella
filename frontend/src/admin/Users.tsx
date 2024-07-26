import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Divider from 'antd/es/divider';
import Tag from 'antd/es/tag';
import { getTableComponents, ColumnTypes, getListQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';
import { UserSchema, type UserListItem } from 'common/schema';

const components = getTableComponents(UserSchema);

export default function AdminUsers() {
	const { result, isMutating, handleSave } = getListQueries<UserListItem>('/api/user', 'user');

	const defaultColumns: DefaultColumns = [
		{
			title: 'Avatar',
			dataIndex: 'avatarURL',
			editable: false,
			render: (avatarURL: string) => <img src={avatarURL} style={{ margin: 0, padding: 0, width: 50 }} alt="avatar" />
		},
		{
			title: 'Name',
			dataIndex: 'name',
			editable: false
		},
		{
			title: 'Username',
			dataIndex: 'username',
			editable: false
		},
		{
			title: 'Nickname',
			dataIndex: 'nickname',
			editable: false
		},
		{
			title: 'Roles',
			dataIndex: 'roles',
			editable: false,
			render: (roles: string[]) =>
				roles
					.filter((role) => role !== '@everyone' && role !== 'AllUsers')
					.map((role) => (
						<Tag color={'geekblue'} key={role}>
							{role}
						</Tag>
					))
		}
	];

	const columns = getColumns<UserListItem>(defaultColumns, handleSave);

	return (
		<WrapCRUD<UserListItem> result={result}>
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

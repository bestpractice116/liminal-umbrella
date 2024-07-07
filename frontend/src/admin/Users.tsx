import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Divider from 'antd/es/divider';
import Tag from 'antd/es/tag';
import { getTableComponents, ColumnTypes, getQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';
import { UserSchema } from 'common/schema';
import * as z from 'zod';

type UserListItem = z.infer<typeof UserSchema.read>;

const components = getTableComponents(UserSchema);

export default function AdminUsers() {
	const { result, isMutating, handleSave } = getQueries<UserListItem>('/api/user', 'user');

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
				<div>This page is for Users</div>
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

import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Tag from 'antd/es/tag';
import { getTableComponents, ColumnTypes, getListQueries, getColumns, DefaultColumns, WrapCRUD } from '../../lib/CRUD.js';
import { UserSchema, type UserListItem } from 'common/schema';

const components = getTableComponents(UserSchema);

type UserFragment = {
	roles: RoleFragment[];
};
type RoleFragment = {
	name: string;
	hexColor: string;
	position: number;
};

export function AdminUsers() {
	const { result, isMutating, handleSave } = getListQueries<UserListItem>('/api/user', 'user');

	const defaultColumns: DefaultColumns = [
		{
			title: 'Avatar',
			dataIndex: 'avatarURL',
			editable: false,
			ellipsis: true,
			render: (avatarURL: string) => <img src={avatarURL} style={{ margin: 0, padding: 0, width: 50 }} alt="avatar" />
		},
		{
			title: 'Nickname',
			dataIndex: 'nickname',
			editable: false,
			ellipsis: true,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			render: (nickname: string, _record: any) => {
				const record = _record as UserFragment;
				const roles = record.roles
					.filter((role: RoleFragment) => role.hexColor != '#000000')
					.toSorted((a, b) => {
						if (a.position < b.position) return 1;
						if (a.position > b.position) return -1;
						return 0;
					});
				let color: string | undefined = undefined;
				if (roles.length > 0) color = roles[0].hexColor;
				return (
					<span style={{ color }}>
						<b>{nickname}</b>
					</span>
				);
			}
		},
		{
			title: 'Name',
			dataIndex: 'name',
			editable: false,
			ellipsis: true
		},
		{
			title: 'Username',
			dataIndex: 'username',
			editable: false,
			ellipsis: true
		},
		{
			title: 'Roles',
			dataIndex: 'roles',
			editable: false,
			ellipsis: true,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			render: (roles: { name: string; hexColor: string }[], record: any) =>
				roles
					.filter((role) => role.name !== '@everyone' && role.name !== 'AllUsers')
					.toSorted((a, b) => {
						if (a.name > b.name) return 1;
						if (a.name < b.name) return -1;
						return 0;
					})
					.map((role, index) => (
						<span key={`${record.key}${index}`}>
							<Tag color={role.hexColor == '#000000' ? undefined : role.hexColor}>{role.name}</Tag>
							<br />
						</span>
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

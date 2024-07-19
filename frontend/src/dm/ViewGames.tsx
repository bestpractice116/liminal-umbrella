import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Button from 'antd/es/button';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { GameSchema, type GameListItem } from 'common/schema';
import { getTableComponents, ColumnTypes, getListQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';
import { isAdmin } from '../Auth.js';
import dayjs from 'dayjs';
const components = getTableComponents(GameSchema);

export default function ViewGames() {
	const admin = isAdmin();
	const { result, isMutating, handleSave } = getListQueries<GameListItem>('/api/gamesessions', 'gamesessions');

	const defaultColumns: DefaultColumns = [
		{
			title: 'Edit',
			dataIndex: 'edit',
			render: (_, record) => {
				return (
					<Link to={`../viewgame/${record.key}`} relative="path">
						<EditOutlined />
					</Link>
				);
			}
		},
		{
			title: 'Name',
			dataIndex: 'name',
			editable: false
		},
		{
			title: 'Type',
			dataIndex: 'type',
			editable: false
		},
		{
			title: 'Gamesystem',
			dataIndex: 'gamesystem',
			editable: false
		},
		{
			title: 'Date & Time',
			dataIndex: 'starttime',
			editable: false,
			render: (_, record) => dayjs(record.starttime).format('ddd, MMM D h:mm A - ') + dayjs(record.endtime).format('h:mm A')
		}
	];
	if (admin) {
		defaultColumns.push({
			title: 'Owner',
			dataIndex: 'owner',
			editable: false
		});
	}

	const columns = getColumns<GameListItem>(defaultColumns, handleSave);
	return (
		<>
			<Link to={`../newgame`} relative="path">
				<Button type="primary" style={{ marginBottom: 16 }}>
					Create new game
				</Button>
			</Link>
			<WrapCRUD<GameListItem> result={result}>
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
		</>
	);
}

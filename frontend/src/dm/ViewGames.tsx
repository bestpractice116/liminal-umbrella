import Table from 'antd/es/table';
import Spin from 'antd/es/spin';
import Button from 'antd/es/button';
import Tooltip from 'antd/es/tooltip';
import { EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { GameSchema, type GameListItem } from 'common/schema';
import { getTableComponents, ColumnTypes, getListQueries, getColumns, DefaultColumns, WrapCRUD } from '../CRUD.js';
import { isAdmin } from '../Auth.js';
import UserRecord from './UserRecord.js';
import dayjs from '../dayjs.js';
const components = getTableComponents(GameSchema);

function toolTipValue(value: any, _record: any) {
	return (
		<Tooltip placement="topLeft" title={value}>
			{value}
		</Tooltip>
	);
}

export default function ViewGames() {
	const admin = isAdmin();
	const { result, isMutating, handleSave } = getListQueries<GameListItem>('/api/gamesessions', 'gamesessions');

	const defaultColumns: DefaultColumns = [
		{
			title: 'Edit',
			dataIndex: 'edit',
			render: (_, record) => {
				if (new Date(record.starttime) < new Date(Date.now())) return <></>;
				return (
					<Link style={{ width: '100%', display: 'inline-block' }} to={`../viewgame/${record.key}`} relative="path">
						<EditOutlined />
					</Link>
				);
			},
			ellipsis: true
		},
		{
			title: 'Name',
			dataIndex: 'name',
			editable: false,
			ellipsis: true,
			render: toolTipValue
		},
		{
			title: 'Type',
			dataIndex: 'type',
			editable: false,
			ellipsis: true,
			render: toolTipValue
		},
		{
			title: 'Gamesystem',
			dataIndex: 'gamesystem',
			editable: false,
			ellipsis: true,
			render: toolTipValue
		},
		{
			title: 'Players',
			dataIndex: 'players',
			editable: false,
			ellipsis: true,
			render: (_, record) => {
				const playerCount = `${(record.signedupplayers || []).length} / ${record.maxplayers}`;
				return (
					<Tooltip placement="topLeft" title={playerCount}>
						{playerCount}
					</Tooltip>
				);
			}
		},
		{
			title: 'Date & Time',
			dataIndex: 'starttime',
			editable: false,
			ellipsis: true,
			render: (_, record) =>
				toolTipValue(dayjs(record.starttime).format('ddd, MMM D h:mm A - ') + dayjs(record.endtime).format('h:mm A'), record)
		}
	];
	if (admin) {
		defaultColumns.push({
			title: 'Owner',
			dataIndex: 'owner',
			editable: false,
			ellipsis: true,
			render: (_, record) => <UserRecord user={record.owner} />
		});
	}
	for (const col of defaultColumns) {
		col['onCell'] = (_record, _rowIndex) => {
			return { style: { padding: 0, margin: 0, textAlign: 'center' } };
		};
	}

	const columns = getColumns<GameListItem>(defaultColumns, handleSave);
	return (
		<>
			<div style={{ margin: '1em', padding: 0 }}>
				<Link to={`../newgame`} relative="path">
					<Button type="primary">Create new game</Button>
				</Link>
			</div>
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

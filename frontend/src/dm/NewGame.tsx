import { useState } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import TimePicker from 'antd/es/time-picker';
import DatePicker from 'antd/es/date-picker';
import Select from 'antd/es/select';
import dayjs from 'dayjs';
import { type GameSystemListItem, type GameListItem, GameSchema } from 'common/schema';
import { getListQueries, WrapCRUD, getCreateMutation, CreateForm, getFetchQuery } from '../CRUD.js';
import Spin from 'antd/es/spin';
import { getZObject } from 'common';
import { createSchemaFieldRule } from 'antd-zod';

const createFormRule = createSchemaFieldRule(getZObject(GameSchema.create!));

export default function PostGame() {
	return <GetGameSystems />;
}

function GetGameSystems() {
	const { result } = getListQueries<GameSystemListItem>('/api/gamesystem', 'gamesystem');
	const gamesystems: GameSystemListItem[] = result.isSuccess ? result.data : [];
	return (
		<WrapCRUD result={result}>
			<PostGameForm gamesystems={gamesystems} />
		</WrapCRUD>
	);
}

function PostGameForm({ gamesystems }: { gamesystems: GameSystemListItem[] }) {
	const [isCreating, setIsCreating] = useState(false);
	const result = getFetchQuery<Array<GameListItem>>('/api/game', 'game');
	const createMutation = getCreateMutation('/api/game', setIsCreating, (_data: any) => {});

	const gamesystems_items = gamesystems.map((system) => {
		return { value: system.name, label: <span>{system.description}</span> };
	});
	// One shot/Ongoing campaign/Drop in and out campaign
	const gametypes = [
		{ value: 'oneshot', label: <span>One shot</span> },
		{ value: 'campaign', label: <span>Ongoing campaign</span> },
		{ value: 'dropin', label: <span>Drop in and out campaign</span> }
	];
	let initialvalues: any = {
		starttime: dayjs('18:00', 'HH:mm'),
		endtime: dayjs('22:00', 'HH:mm'),
		maxplayers: 4
	};
	if (result.isFetched && result.data && result.data.length == 1) {
		console.log(result.data[0]);
		const res = GameSchema.read.safeParse(result.data[0]);
		if (!res.success) {
			console.log(res.error);
		} else {
			initialvalues = res.data;
		}
	}
	console.log(initialvalues);
	if (!result.isFetched) {
		return <Spin spinning={true} fullscreen />;
	}
	return (
		<CreateForm createMutation={createMutation} setIsCreating={setIsCreating} initialValues={initialvalues}>
			<Spin spinning={isCreating || result.isFetching} fullscreen />
			<Form.Item<GameListItem> label="Name" name="name" rules={[createFormRule]}>
				<Input />
			</Form.Item>

			<Form.Item<GameListItem> label="Type of Adventure" name="type" rules={[createFormRule]}>
				<Select options={gametypes} />
			</Form.Item>

			<Form.Item<GameListItem> label="Game System" name="gamesystem" rules={[createFormRule]}>
				<Select options={gamesystems_items} />
			</Form.Item>

			<Form.Item<GameListItem> label="Location" name="location" rules={[createFormRule]}>
				<Input />
			</Form.Item>

			<Form.Item<GameListItem> label="Description" name="description" rules={[createFormRule]}>
				<Input.TextArea />
			</Form.Item>

			<Form.Item<GameListItem> label="Max Players" name="maxplayers" rules={[createFormRule]}>
				<Select
					options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
						return { value: idx, label: <span>{idx}</span> };
					})}
				/>
			</Form.Item>
		</CreateForm>
	);
}

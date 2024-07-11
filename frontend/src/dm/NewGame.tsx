import { useState } from 'react';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import TimePicker from 'antd/es/time-picker';
import DatePicker, { type DatePickerProps } from 'antd/es/date-picker';
import Select from 'antd/es/select';
import dayjs from 'dayjs';
import { type GameSystemListItem, GameSchema } from 'common/schema';
import { getQueries, WrapCRUD, getCreateMutation, CreateForm } from '../CRUD.js';
import Spin from 'antd/es/spin';
import { getZObject } from 'common';
import { createSchemaFieldRule } from 'antd-zod';

const createFormRule = createSchemaFieldRule(getZObject(GameSchema.create!));

export default function PostGame() {
	return <GetGameSystems />;
}

function GetGameSystems() {
	const { result } = getQueries<GameSystemListItem>('/api/gamesystem', 'gamesystem');
	const gamesystems: GameSystemListItem[] = result.isSuccess ? result.data : [];
	return (
		<WrapCRUD result={result}>
			<PostGameForm gamesystems={gamesystems} />
		</WrapCRUD>
	);
}

function PostGameForm({ gamesystems }: { gamesystems: GameSystemListItem[] }) {
	const [isCreating, setIsCreating] = useState(false);
	const createMutation = getCreateMutation('/api/game', setIsCreating, (_data: any) => {});
	type FieldType = {
		title?: string;
		type?: string;
		description?: string;
		gamesystem: string;
		starttime: dayjs.ConfigType;
		endtime: dayjs.ConfigType;
		date?: dayjs.ConfigType;
		location?: string;
		maxplayers?: string;
	};

	const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
		console.log(date, dateString);
	};
	const gamesystems_items = gamesystems.map((system) => {
		return { value: system.name, label: <span>{system.description}</span> };
	});
	// One shot/Ongoing campaign/Drop in and out campaign
	const gametypes = [
		{ value: 'oneshot', label: <span>One shot</span> },
		{ value: 'campaign', label: <span>Ongoing campaign</span> },
		{ value: 'dropin', label: <span>Drop in and out campaign</span> }
	];

	return (
		<CreateForm
			createMutation={createMutation}
			setIsCreating={setIsCreating}
			initialValues={{
				starttime: dayjs('18:00', 'HH:mm'),
				endtime: dayjs('22:00', 'HH:mm'),
				maxplayers: 4
			}}
		>
			<Spin spinning={isCreating} fullscreen />
			<Form.Item<FieldType> label="Title" name="title" rules={[createFormRule]}>
				<Input />
			</Form.Item>

			<Form.Item<FieldType> label="Type of Adventure" name="type" rules={[createFormRule]}>
				<Select options={gametypes} />
			</Form.Item>

			<Form.Item<FieldType> label="Game System" name="gamesystem" rules={[createFormRule]}>
				<Select options={gamesystems_items} />
			</Form.Item>

			<Form.Item<FieldType> name="date" label="Date" rules={[createFormRule]}>
				<DatePicker onChange={onDateChange} minDate={dayjs().add(1, 'day')} format={'dddd D MMM (YYYY-MM-DD)'} />
			</Form.Item>

			<Form.Item<FieldType> name="starttime" label="Start Time" rules={[createFormRule]}>
				<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="large" />
			</Form.Item>

			<Form.Item<FieldType> name="endtime" label="End Time" rules={[createFormRule]}>
				<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="large" />
			</Form.Item>

			<Form.Item<FieldType> label="Location" name="location" rules={[createFormRule]}>
				<Input />
			</Form.Item>

			<Form.Item<FieldType> label="Description" name="description" rules={[createFormRule]}>
				<Input.TextArea />
			</Form.Item>

			<Form.Item<FieldType> label="Max Players" name="maxplayers" rules={[createFormRule]}>
				<Select
					options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
						return { value: idx, label: <span>{idx}</span> };
					})}
				/>
			</Form.Item>
		</CreateForm>
	);
}

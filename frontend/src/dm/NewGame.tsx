import { useState, createRef } from 'react';
import Form from 'antd/es/form';
import { FormRef } from 'rc-field-form/es/interface.js';
import Input from 'antd/es/input';
import TimePicker from 'antd/es/time-picker';
import DatePicker from 'antd/es/date-picker';
import Button from 'antd/es/button';
import Select from 'antd/es/select';
import dayjs from 'dayjs';
import { type GameSystemListItem, type GameListItem, GameSchema, gametypes, gametypesEnabled } from 'common/schema';
import { getListQueries, WrapCRUD, getCreateMutation, CreateForm, getFetchQuery, getUpdateMutation } from '../CRUD.js';
import Spin from 'antd/es/spin';
import { getZObject } from 'common';
import { createSchemaFieldRule } from 'antd-zod';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { useErrorBoundary } from '../ErrorFallback';

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
	const { showBoundary } = useErrorBoundary();
	const [isCreating, setIsCreating] = useState(false);
	const result = getFetchQuery<Array<GameListItem>>('/api/game', 'game');
	const createMutation = getCreateMutation('/api/game', setIsCreating, (_data: any) => {});
	const updateMutation = getUpdateMutation('/api/game', setIsCreating, () => {
		console.log('updated');
	});

	const gamesystems_items = gamesystems.map((system) => {
		return { value: system.name, label: <span>{system.description}</span> };
	});
	// One shot/Ongoing campaign/Drop in and out campaign
	const gametypes_items: { value: string; label: any; disabled: boolean }[] = Object.entries(gametypes).map(([k, v]) => {
		return { value: k, label: <span>{v}</span>, disabled: !gametypesEnabled[k] };
	});
	let initialvalues: any = {
		starttime: dayjs('18:00', 'HH:mm'),
		endtime: dayjs('22:00', 'HH:mm'),
		maxplayers: 4,
		type: 'oneshot'
	};
	let hasGame = false;
	if (result.isFetched && result.data && result.data.length == 1) {
		const res = GameSchema.read.safeParse(result.data[0]);
		if (!res.success) {
			console.log(res.error);
		} else {
			initialvalues = res.data;
			hasGame = true;
		}
	}
	if (!result.isFetched) {
		return <Spin spinning={true} fullscreen />;
	}
	let mutation = createMutation;
	if (hasGame) {
		mutation = updateMutation;
	}
	const formRef = createRef<FormRef>();
	const save = () => {
		if (!formRef.current) {
			return;
		}
		const data = formRef.current!.getFieldsValue();
		setIsCreating(true);
		mutation.mutate(data, {
			onSuccess: () => {
				setIsCreating(false);
			},
			onError: (_e) => {
				setIsCreating(false);
			}
		});
	};
	const postgame = () => {
		console.log('postgame');
		const data = formRef.current!.getFieldsValue();
		setIsCreating(true);
		mutation.mutate(data, {
			onSuccess: () => {
				return fetch(
					'/api/gamepost',
					{
						method: FetchMethods.Post,
						body: JSON.stringify({ key: data.key }),
						headers: {
							'Content-Type': 'application/json'
						}
					},
					FetchResultTypes.JSON
				)
					.then((data) => {
						console.log('POSTED GAME ', data);
						setIsCreating(false);
					})
					.catch((e) => showBoundary(e));
			},
			onError: () => {
				setIsCreating(false);
			}
		});
	};

	return (
		<CreateForm formRef={formRef} createMutation={mutation} setIsCreating={setIsCreating} initialValues={initialvalues}>
			<Spin spinning={isCreating || result.isFetching} fullscreen />
			<Form.Item<GameListItem> name="key">
				<Input type="hidden" />
			</Form.Item>

			<Form.Item<GameListItem> label="Name" name="name" rules={[createFormRule]}>
				<Input onPressEnter={save} onBlur={save} />
			</Form.Item>

			<Form.Item<GameListItem> label="Type of Adventure" name="type" rules={[createFormRule]}>
				<Select options={gametypes_items} onBlur={save} onSelect={save} />
			</Form.Item>

			<Form.Item<GameListItem> label="Game System" name="gamesystem" rules={[createFormRule]}>
				<Select options={gamesystems_items} onBlur={save} onSelect={save} />
			</Form.Item>

			<Form.Item<GameListItem> name="date" label="Date" rules={[createFormRule]}>
				<DatePicker
					minDate={dayjs().add(1, 'day')}
					format={'dddd D MMM (YYYY-MM-DD)'}
					onChange={(val) => {
						if (val) save();
					}}
				/>
			</Form.Item>

			<Form.Item<GameListItem> name="starttime" label="Start Time" rules={[createFormRule]}>
				<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="large" onBlur={save} onChange={save} />
			</Form.Item>

			<Form.Item<GameListItem> name="endtime" label="End Time" rules={[createFormRule]}>
				<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="large" onBlur={save} onChange={save} />
			</Form.Item>

			<Form.Item<GameListItem> label="Location" name="location" rules={[createFormRule]}>
				<Input onPressEnter={save} onBlur={save} />
			</Form.Item>

			<Form.Item<GameListItem> label="Description" name="description" rules={[createFormRule]}>
				<Input.TextArea onBlur={save} />
			</Form.Item>

			<Form.Item<GameListItem> label="Max Players" name="maxplayers" rules={[createFormRule]}>
				<Select
					options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
						return { value: idx, label: <span>{idx}</span> };
					})}
					onBlur={save}
					onChange={save}
				/>
			</Form.Item>
			<Form.Item label="Post">
				<Button onClick={postgame}>Post</Button>
			</Form.Item>
		</CreateForm>
	);
}

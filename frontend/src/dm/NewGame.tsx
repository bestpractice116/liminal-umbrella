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
import { UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';

const createFormRule = createSchemaFieldRule(getZObject(GameSchema.create!));

function GameSystemsSelect({ save, disabled }: { save: () => void; disabled: boolean }) {
	const { result } = getListQueries<GameSystemListItem>('/api/gamesystem', 'gamesystem');
	const gamesystems: GameSystemListItem[] = result.isSuccess ? result.data : [];
	const loading = result.isFetching;

	// FIXME - do we need the WrapCRUD spinner here, or is loading component enough
	return (
		<WrapCRUD result={result}>
			<GameSystemsSelectHTML gamesystems={gamesystems} save={save} loading={loading} disabled={disabled} />
		</WrapCRUD>
	);
}

function GameSystemsSelectHTML({
	gamesystems,
	save,
	loading,
	disabled
}: {
	gamesystems: GameSystemListItem[];
	save: () => void;
	loading: boolean;
	disabled: boolean;
}) {
	const gamesystems_items = gamesystems.map((system) => {
		return { value: system.name, label: <span>{system.description}</span> };
	});
	return (
		<Form.Item<GameListItem> label="Game System" name="gamesystem" rules={[createFormRule]}>
			<Select options={gamesystems_items} onBlur={save} onSelect={save} loading={loading} disabled={disabled} />
		</Form.Item>
	);
}

function GameTypeSelect({ save, disabled }: { save: () => void; disabled: boolean }) {
	const gametypes_items: { value: string; label: any; disabled: boolean }[] = Object.entries(gametypes).map(([k, v]) => {
		return { value: k, label: <span>{v}</span>, disabled: !gametypesEnabled[k] };
	});

	return (
		<Form.Item<GameListItem> label="Type of Adventure" name="type" rules={[createFormRule]}>
			<Select options={gametypes_items} onBlur={save} onSelect={save} disabled={disabled} />
		</Form.Item>
	);
}

export default function PostGame() {
	const { showBoundary } = useErrorBoundary();
	const formRef = createRef<FormRef>();
	// FIXME - this name is bad as it isn't just creating
	const [isCreating, setIsCreating] = useState(false);
	const [postId, setPostId] = useState(-1);
	const result = getFetchQuery<Array<GameListItem>>('/api/game', 'game');
	const queryClient = useQueryClient();
	const createMutation = getCreateMutation('/api/game', 'game', setIsCreating, (data: any) => {
		formRef.current!.setFieldValue('key', data!.datum!.key);
		queryClient.setQueryData(['game'], (old: any) => {
			return [...(old || []), data.datum];
		});
	});
	const updateMutation = getUpdateMutation('/api/game', 'game', setIsCreating, () => {
		//console.log('updated');
	});

	let initialvalues: any = {
		starttime: dayjs('18:00', 'HH:mm'),
		endtime: dayjs('22:00', 'HH:mm'),
		maxplayers: 4,
		type: 'oneshot'
	};
	let hasGame = false;
	if (result.isFetched && result.data && result.data.length == 1) {
		const res = getZObject(GameSchema.read).partial().safeParse(result.data[0]);
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
	const save = () => {
		if (!formRef.current) {
			return;
		}
		const data = formRef.current!.getFieldsValue();
		setIsCreating(true);
		mutation.mutate(data, {
			// FIXME - why do we have some logic in getCreateMutation and some here.
			onSuccess: (_data) => {
				setIsCreating(false);
			},
			onError: (_e) => {
				setIsCreating(false);
			}
		});
	};
	const postgame = () => {
		const data = formRef.current!.getFieldsValue();
		setIsCreating(true);
		mutation.mutate(data, {
			onSuccess: () => {
				// FIXME pull this out to it's own function?
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
					.then((data: any) => {
						// FIXME - any
						queryClient.resetQueries(
							{
								queryKey: ['game'],
								exact: true
							},
							{ throwOnError: true }
						);
						setIsCreating(false);
						setPostId(data.datum.key);
					})
					.catch((e) => showBoundary(e));
			},
			onError: (e) => {
				setIsCreating(false);
				throw e;
			}
		});
	};

	if (postId > 0) {
		return <Navigate to={`/dm/viewgame/${postId}`} />;
	}

	return (
		<PostGameForm
			isLoading={isCreating || result.isFetching}
			save={save}
			setIsCreating={setIsCreating}
			formRef={formRef}
			mutation={mutation}
			initialvalues={initialvalues}
		>
			<Form.Item label="Post">
				<Button onClick={postgame}>Post</Button>
			</Form.Item>
		</PostGameForm>
	);
}

export function PostGameForm({
	save,
	setIsCreating,
	formRef,
	isLoading,
	mutation,
	initialvalues,
	children = <></>,
	createForm = true
}: {
	setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
	save: () => void;
	isLoading: boolean;
	formRef: React.RefObject<FormRef>;
	mutation: UseMutationResult<void, Error, any, void>;
	initialvalues: { [key: string]: any };
	children?: React.ReactNode;
	createForm?: boolean;
}) {
	const [formData, setFormData] = useState(initialvalues);
	const hasChanged = () => {
		setFormData(formRef.current?.getFieldsValue());
	};

	const getValidateStatus = (name: string) => {
		if (createForm) return undefined;
		// This is gross, but this seems like the easiest way to compare dayjs objects.
		return `${formData[name]}` != `${initialvalues[name]}` ? 'error' : undefined;
	};
	return (
		<>
			<CreateForm formRef={formRef} mutation={mutation} setIsMutating={setIsCreating} initialValues={initialvalues}>
				<Spin spinning={isLoading} fullscreen />
				<Form.Item<GameListItem> name="key">
					<Input type="hidden" />
				</Form.Item>

				<Form.Item<GameListItem> label="Name" name="name" rules={[createFormRule]} validateStatus={getValidateStatus('name')}>
					<Input onPressEnter={save} onBlur={save} onChange={hasChanged} />
				</Form.Item>

				<GameTypeSelect save={save} disabled={!createForm} />

				<GameSystemsSelect save={save} disabled={!createForm} />

				<Form.Item<GameListItem> name="date" label="Date" rules={[createFormRule]} validateStatus={getValidateStatus('date')}>
					<DatePicker
						minDate={dayjs().add(1, 'day')}
						format={'dddd D MMM (YYYY-MM-DD)'}
						onChange={(val) => {
							if (val) {
								hasChanged();
								save();
							}
						}}
					/>
				</Form.Item>

				<Form.Item<GameListItem> name="starttime" label="Start Time" rules={[createFormRule]} validateStatus={getValidateStatus('starttime')}>
					<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="large" onBlur={save} onChange={hasChanged} />
				</Form.Item>

				<Form.Item<GameListItem> name="endtime" label="End Time" rules={[createFormRule]} validateStatus={getValidateStatus('endtime')}>
					<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="large" onBlur={hasChanged} onChange={hasChanged} />
				</Form.Item>

				<Form.Item<GameListItem> label="Location" name="location" rules={[createFormRule]} validateStatus={getValidateStatus('location')}>
					<Input onPressEnter={save} onBlur={save} onChange={hasChanged} />
				</Form.Item>

				<Form.Item<GameListItem>
					label="Description"
					name="description"
					rules={[createFormRule]}
					validateStatus={getValidateStatus('description')}
				>
					<Input.TextArea onBlur={save} onChange={hasChanged} />
				</Form.Item>

				<Form.Item<GameListItem>
					label="Max Players"
					name="maxplayers"
					rules={[createFormRule]}
					validateStatus={getValidateStatus('maxplayers')}
				>
					<Select
						options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
							return { value: idx, label: <span>{idx}</span> };
						})}
						onBlur={save}
						onChange={hasChanged}
					/>
				</Form.Item>
				{children}
			</CreateForm>
		</>
	);
}

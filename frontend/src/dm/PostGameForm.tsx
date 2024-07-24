import { useState } from 'react';
import Form from 'antd/es/form';
import { FormRef } from 'rc-field-form/es/interface.js';
import Input from 'antd/es/input';
import TimePicker from 'antd/es/time-picker';
import DatePicker from 'antd/es/date-picker';
import Select from 'antd/es/select';
import dayjs from 'dayjs';
import Spin from 'antd/es/spin';
import { type GameSystemListItem, type GameListItem, GameSchema, gametypes, gametypesEnabled } from 'common/schema';
import { getListQueries, WrapCRUD, CreateForm } from '../CRUD.js';
import { createSchemaFieldRule } from 'antd-zod';
import { UseMutationResult } from '@tanstack/react-query';
import { getZObject } from 'common';

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

export default function PostGameForm({
	save,
	setIsCreating,
	formRef,
	isLoading,
	mutation,
	initialvalues,
	children = <></>,
	createForm = true,
	disabled = false
}: {
	setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
	save: () => void;
	isLoading: boolean;
	formRef: React.RefObject<FormRef>;
	mutation: UseMutationResult<void, Error, any, void>;
	initialvalues: { [key: string]: any };
	children?: React.ReactNode;
	createForm?: boolean;
	disabled?: boolean;
}) {
	const [formData, setFormData] = useState(initialvalues);
	const hasChanged = () => {
		const values = formRef.current?.getFieldsValue();
		if (values.date) {
			values.date = values.date.clone().hour(12).minute(0).second(0).millisecond(0);
			if (values.starttime) {
				values.starttime = values.starttime.clone().year(values.date.year()).month(values.date.month()).day(values.date.day());
			}
			if (values.endtime) {
				values.endtime = values.endtime.clone().year(values.date.year()).month(values.date.month()).day(values.date.day());
			}
		}
		setFormData(values);
	};

	const getValidateStatus = (name: string) => {
		if (createForm) return undefined;
		if (name == 'starttime' || name == 'endtime') {
			return formData[name].format('HH:mm') != initialvalues[name].format('HH:mm') ? 'error' : undefined;
		}
		if (name == 'date') {
			return formData[name].format('YYYY-MM-DD') != initialvalues[name].format('YYYY-MM-DD') ? 'error' : undefined;
		}
		return `${formData[name]}` != `${initialvalues[name]}` ? 'error' : undefined;
	};
	return (
		<>
			<CreateForm formRef={formRef} mutation={mutation} setIsMutating={setIsCreating} initialValues={initialvalues} submitButton={false}>
				<Spin spinning={isLoading} fullscreen />
				<Form.Item<GameListItem> name="key">
					<Input type="hidden" />
				</Form.Item>

				<Form.Item<GameListItem> label="Name" name="name" rules={[createFormRule]} validateStatus={getValidateStatus('name')}>
					<Input onPressEnter={save} onBlur={save} onChange={hasChanged} disabled={disabled} />
				</Form.Item>

				<GameTypeSelect save={save} disabled={disabled || !createForm} />

				<GameSystemsSelect save={save} disabled={disabled || !createForm} />

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
						disabled={disabled}
					/>
				</Form.Item>

				<Form.Item<GameListItem> name="starttime" label="Start Time" rules={[createFormRule]} validateStatus={getValidateStatus('starttime')}>
					<TimePicker
						showNow={false}
						minuteStep={15}
						format={'HH:mm'}
						size="large"
						onBlur={save}
						onChange={hasChanged}
						disabled={disabled}
					/>
				</Form.Item>

				<Form.Item<GameListItem> name="endtime" label="End Time" rules={[createFormRule]} validateStatus={getValidateStatus('endtime')}>
					<TimePicker
						showNow={false}
						minuteStep={15}
						format={'HH:mm'}
						size="large"
						onBlur={hasChanged}
						onChange={hasChanged}
						disabled={disabled}
					/>
				</Form.Item>

				<Form.Item<GameListItem> label="Location" name="location" rules={[createFormRule]} validateStatus={getValidateStatus('location')}>
					<Input onPressEnter={save} onBlur={save} onChange={hasChanged} disabled={disabled} />
				</Form.Item>

				<Form.Item<GameListItem>
					label="Description"
					name="description"
					rules={[createFormRule]}
					validateStatus={getValidateStatus('description')}
				>
					<Input.TextArea onBlur={save} onChange={hasChanged} disabled={disabled} />
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
						disabled={disabled}
					/>
				</Form.Item>
				{children}
			</CreateForm>
		</>
	);
}

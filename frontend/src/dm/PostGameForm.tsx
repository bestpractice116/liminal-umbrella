import { useState } from 'react';
import Form from 'antd/es/form';
import { FormRef, NamePath } from 'rc-field-form/es/interface.js';
import Input from 'antd/es/input';
import TimePicker from 'antd/es/time-picker';
import DatePicker from 'antd/es/date-picker';
import Select from 'antd/es/select';
import dayjs from '../dayjs.js';
import Spin from 'antd/es/spin';
import { ColProps } from 'antd/es/col';
import { type GameListItem, GameSchema } from 'common/schema';
import { CreateForm } from '../CRUD.js';
import { createSchemaFieldRule } from 'antd-zod';
import { UseMutationResult } from '@tanstack/react-query';
import { getZObject } from 'common';
import GameSystemSelect from './GameSystemSelect.js';
import GameTypeSelect from './GameTypeSelect.js';

const createFormRule = createSchemaFieldRule(getZObject(GameSchema.create!));

export default function PostGameForm({
	save,
	setIsCreating,
	formRef,
	isLoading,
	mutation,
	initialvalues,
	children = <></>,
	createForm = true,
	disabled = false,
	submitButtonText
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
	submitButtonText?: string;
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
		if ((name == 'starttime' || name == 'endtime') && formData[name] && initialvalues[name]) {
			return formData[name].format('HH:mm') != initialvalues[name].format('HH:mm') ? 'error' : undefined;
		}
		if (name == 'date' && formData[name] && initialvalues[name]) {
			return formData[name].format('YYYY-MM-DD') != initialvalues[name].format('YYYY-MM-DD') ? 'error' : undefined;
		}
		return `${formData[name]}` != `${initialvalues[name]}` ? 'error' : undefined;
	};

	const FormItem = ({
		name,
		label,
		children,
		style,
		labelCol,
		wrapperCol
	}: {
		name: NamePath<GameListItem>;
		label: string;
		children: React.ReactNode;
		style?: React.CSSProperties;
		labelCol?: ColProps;
		wrapperCol?: ColProps;
	}) => {
		return (
			<Form.Item<GameListItem>
				wrapperCol={wrapperCol}
				labelCol={labelCol}
				style={style}
				name={name}
				label={label}
				rules={[createFormRule]}
				validateStatus={getValidateStatus(`${name}`)}
			>
				{children}
			</Form.Item>
		);
	};

	const TimeControl = ({
		name,
		label,
		labelCol,
		wrapperCol,
		style
	}: {
		name: NamePath<GameListItem>;
		label: string;
		labelCol?: ColProps;
		wrapperCol?: ColProps;
		style?: React.CSSProperties;
	}) => {
		return (
			<FormItem style={style} labelCol={labelCol} wrapperCol={wrapperCol} name={name} label={label}>
				<TimePicker
					showNow={false}
					minuteStep={15}
					format={'HH:mm'}
					size="middle"
					onBlur={hasChanged}
					onChange={hasChanged}
					disabled={disabled}
				/>
			</FormItem>
		);
	};

	return (
		<CreateForm
			formRef={formRef}
			mutation={mutation}
			setIsMutating={setIsCreating}
			initialValues={initialvalues}
			submitButton={!createForm}
			submitButtonText={submitButtonText}
		>
			<Spin spinning={isLoading} fullscreen />
			<Form.Item<GameListItem> name="key">
				<Input type="hidden" />
			</Form.Item>

			<FormItem label="Name" name="name">
				<Input onPressEnter={save} onBlur={save} onChange={hasChanged} disabled={disabled} />
			</FormItem>

			<GameTypeSelect save={save} disabled={disabled || !createForm} />

			<GameSystemSelect save={save} disabled={disabled || !createForm} />

			<FormItem wrapperCol={{ style: { maxWidth: 275, textAlign: 'left' }, offset: 0, span: 20 }} name="date" label="Date">
				<DatePicker
					style={{ width: '250px', paddingRight: '20px' }}
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
			</FormItem>
			<TimeControl wrapperCol={{ style: { maxWidth: 150, textAlign: 'left' }, span: 19 }} name="starttime" label="Start Time" />
			<TimeControl wrapperCol={{ style: { maxWidth: 150, textAlign: 'left' }, span: 19 }} name="endtime" label="End Time" />
			<FormItem label="Location" name="location">
				<Input onPressEnter={save} onBlur={save} onChange={hasChanged} disabled={disabled} />
			</FormItem>

			<FormItem label="Description" name="description">
				<Input.TextArea rows={6} size={'large'} onBlur={save} onChange={hasChanged} disabled={disabled} />
			</FormItem>

			<FormItem wrapperCol={{ style: { maxWidth: 100 }, span: 19 }} label="Max Players" name="maxplayers">
				<Select
					options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
						return { value: idx, label: <span>{idx}</span> };
					})}
					onBlur={save}
					onChange={hasChanged}
					disabled={disabled}
				/>
			</FormItem>
			{children}
		</CreateForm>
	);
}

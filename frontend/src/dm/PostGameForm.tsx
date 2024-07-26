import { useEffect } from 'react';
import Form from 'antd/es/form';
import { FormRef, NamePath } from 'rc-field-form/es/interface.js';
import Input from 'antd/es/input';
import TimePicker from 'antd/es/time-picker';
import DatePicker from 'antd/es/date-picker';
import Select from 'antd/es/select';
import dayjs from '../dayjs.js';
import Spin from 'antd/es/spin';
import { ColProps } from 'antd/es/col';
import { type GameUpdateItem, GameSchema, NewGameSchema } from 'common/schema';
import { CreateForm } from '../CRUD.js';
import { createSchemaFieldRule } from 'antd-zod';
import { UseMutationResult } from '@tanstack/react-query';
import { getZObject } from 'common';
import GameSystemSelect from './GameSystemSelect.js';
import GameTypeSelect from './GameTypeSelect.js';
import { AnyObject } from 'antd/es/_util/type.js';

const createFormRule = createSchemaFieldRule(getZObject(NewGameSchema.create!));
const updateFormRule = createSchemaFieldRule(getZObject(GameSchema.update!));

export default function PostGameForm({
	save,
	setIsCreating,
	formRef,
	isLoading,
	mutation,
	initialValues,
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
	initialValues: { [key: string]: any };
	children?: React.ReactNode;
	createForm?: boolean;
	disabled?: boolean;
	submitButtonText?: string;
}) {
	console.log('Just in PostGameForm with: ', initialValues);
	useEffect(() => {
		formRef.current?.setFieldsValue(initialValues);
	}, [initialValues]);

	const getFormData = (): AnyObject => {
		return formRef.current?.getFieldsValue() || initialValues;
	};
	const hasChanged = () => {
		const values = formRef.current?.getFieldsValue();
		if (values.date) {
			values.date = values.date.clone().hour(12).minute(0).second(0).millisecond(0);
			if (values.starttime) {
				values.starttime = values.starttime.clone().year(values.date.year()).month(values.date.month()).date(values.date.date());
			}
			if (values.endtime) {
				values.endtime = values.endtime.clone().year(values.date.year()).month(values.date.month()).date(values.date.date());
			}
		}
		formRef.current?.setFieldsValue(values);
		save();
	};

	const getValidateStatus = (name: string) => {
		if (createForm) return undefined;
		if ((name == 'starttime' || name == 'endtime') && getFormData()[name] && initialValues[name]) {
			return getFormData()[name].format('HH:mm') != initialValues[name].format('HH:mm') ? 'error' : undefined;
		}
		if (name == 'date' && getFormData()[name] && initialValues[name]) {
			return getFormData()[name].format('YYYY-MM-DD') != initialValues[name].format('YYYY-MM-DD') ? 'error' : undefined;
		}
		console.log(`getValidateStatus for ${name} - formData: ${getFormData()[name]}, initialValues: ${initialValues[name]}`);
		return `${getFormData()[name]}` != `${initialValues[name]}` ? 'error' : undefined;
	};

	const FormItem = ({
		name,
		label,
		children,
		style,
		labelCol,
		wrapperCol
	}: {
		name: NamePath<GameUpdateItem>;
		label: string;
		children: React.ReactNode;
		style?: React.CSSProperties;
		labelCol?: ColProps;
		wrapperCol?: ColProps;
	}) => {
		return (
			<Form.Item<GameUpdateItem>
				wrapperCol={wrapperCol}
				labelCol={labelCol}
				style={style}
				name={name}
				label={label}
				rules={[createForm ? createFormRule : updateFormRule]}
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
		name: NamePath<GameUpdateItem>;
		label: string;
		labelCol?: ColProps;
		wrapperCol?: ColProps;
		style?: React.CSSProperties;
	}) => {
		return (
			<FormItem style={style} labelCol={labelCol} wrapperCol={wrapperCol} name={name} label={label}>
				<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} size="middle" onChange={hasChanged} disabled={disabled} />
			</FormItem>
		);
	};
	console.log('About to include CreateForm: ', initialValues);
	return (
		<div>
			{' '}
			<Spin spinning={isLoading} fullscreen />
			{initialValues ? (
				<CreateForm
					formRef={formRef}
					mutation={mutation}
					setIsMutating={setIsCreating}
					initialValues={initialValues}
					submitButton={!createForm}
					submitButtonText={submitButtonText}
					labelCol={{ span: 3 }}
					wrapperCol={{ span: 21 }}
				>
					<Form.Item<GameUpdateItem> style={{ height: 0, margin: 0 }} name="key">
						<Input type="hidden" />
					</Form.Item>

					<FormItem label="Name" name="name">
						<Input onPressEnter={hasChanged} onBlur={hasChanged} disabled={disabled} />
					</FormItem>

					<GameTypeSelect save={hasChanged} disabled={disabled || !createForm} />

					<GameSystemSelect save={hasChanged} disabled={disabled || !createForm} />

					<FormItem wrapperCol={{ style: { maxWidth: 275, textAlign: 'left' }, offset: 0, span: 20 }} name="date" label="Date">
						<DatePicker
							style={{ width: '250px', paddingRight: '20px' }}
							minDate={dayjs().add(1, 'day')}
							format={'dddd D MMM (YYYY-MM-DD)'}
							onChange={(val) => {
								if (val) {
									hasChanged();
								}
							}}
							disabled={disabled}
						/>
					</FormItem>
					<TimeControl wrapperCol={{ style: { maxWidth: 150, textAlign: 'left' }, span: 19 }} name="starttime" label="Start Time" />
					<TimeControl wrapperCol={{ style: { maxWidth: 150, textAlign: 'left' }, span: 19 }} name="endtime" label="End Time" />
					<FormItem label="Location" name="location">
						<Input onPressEnter={hasChanged} onBlur={hasChanged} disabled={disabled} />
					</FormItem>

					<FormItem label="Description" name="description">
						<Input.TextArea rows={6} size={'large'} onBlur={hasChanged} disabled={disabled} />
					</FormItem>

					<FormItem wrapperCol={{ style: { maxWidth: 100 }, span: 19 }} label="Max Players" name="maxplayers">
						<Select
							options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
								return { value: idx, label: <span>{idx}</span> };
							})}
							onBlur={hasChanged}
							disabled={disabled}
						/>
					</FormItem>
					{children}
				</CreateForm>
			) : (
				<></>
			)}
		</div>
	);
}

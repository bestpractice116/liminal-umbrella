import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Button from 'antd/es/button/button';
import TimePicker from 'antd/es/time-picker';
import DatePicker, { type DatePickerProps } from 'antd/es/date-picker';
import Select from 'antd/es/select';
import dayjs from 'dayjs';
import type { FormProps } from 'antd/es/form/Form';

export default function PostGame() {
	type FieldType = {
		title?: string;
		type?: string;
		description?: string;
		starttime: dayjs.ConfigType;
		endtime: dayjs.ConfigType;
		date?: dayjs.ConfigType;
		location?: string;
		maxplayers?: string;
	};

	const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
		console.log('Success:', values);
	};

	const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};
	const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
		console.log(date, dateString);
	};
	// One shot/Ongoing campaign/Drop in and out campaign
	const gametypes = [
		{ value: 'oneshot', label: <span>One shot</span> },
		{ value: 'campaign', label: <span>Ongoing campaign</span> },
		{ value: 'dropin', label: <span>Drop in and out campaign</span> }
	];
	return (
		<Form
			name="basic"
			labelCol={{ span: 8 }}
			wrapperCol={{ span: 16 }}
			style={{ maxWidth: 600 }}
			initialValues={{ remember: true }}
			onFinish={onFinish}
			onFinishFailed={onFinishFailed}
			autoComplete="off"
		>
			<Form.Item<FieldType> label="Title" name="title" rules={[{ required: true, message: 'Please input a game title!' }]}>
				<Input />
			</Form.Item>

			<Form.Item<FieldType> label="Type of Adventure" name="type">
				<Select options={gametypes} />
			</Form.Item>

			<Form.Item<FieldType> name="date" label="Date">
				<DatePicker onChange={onDateChange} minDate={dayjs().add(1, 'day')} format={'dddd D MMM (YYYY-MM-DD)'} />
			</Form.Item>

			<Form.Item<FieldType> name="starttime" label="Start Time">
				<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} defaultValue={dayjs('18:00', 'HH:mm')} size="large" />
			</Form.Item>

			<Form.Item<FieldType> name="endtime" label="End Time">
				<TimePicker showNow={false} minuteStep={15} format={'HH:mm'} defaultValue={dayjs('22:00', 'HH:mm')} size="large" />
			</Form.Item>

			<Form.Item<FieldType> label="Location" name="location" rules={[{ required: true, message: 'Please input a location!' }]}>
				<Input />
			</Form.Item>

			<Form.Item<FieldType> label="Description" name="description" rules={[{ required: true, message: 'Please input a short description' }]}>
				<Input.TextArea />
			</Form.Item>

			<Form.Item<FieldType> label="Max Players" name="maxplayers" rules={[{ required: true, message: 'Please input max number of players' }]}>
				<Select
					defaultValue={4}
					options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
						return { value: idx, label: <span>{idx}</span> };
					})}
				/>
			</Form.Item>

			<Form.Item wrapperCol={{ offset: 8, span: 16 }}>
				<Button type="primary" htmlType="submit">
					Submit
				</Button>
			</Form.Item>
		</Form>
	);
}

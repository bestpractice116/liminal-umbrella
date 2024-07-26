import Form from 'antd/es/form';
import Select from 'antd/es/select';
import { type GameUpdateItem, gametypes, gametypesEnabled, gameTypeSchema } from 'common/schema';
import { createSchemaFieldRule } from 'antd-zod';
import { getZObject } from 'common';

const createFormRule = createSchemaFieldRule(getZObject(gameTypeSchema));

export type GameTypeSelectInputs = { save: () => void; disabled: boolean };

export default function GameTypeSelect({ save, disabled }: GameTypeSelectInputs) {
	const gametypes_items: { value: string; label: any; disabled: boolean }[] = Object.entries(gametypes).map(([k, v]) => {
		return { value: k, label: <span>{v}</span>, disabled: !gametypesEnabled[k] };
	});

	return (
		<Form.Item<GameUpdateItem> label="Type of Adventure" name="type" rules={[createFormRule]}>
			<Select style={{ textAlign: 'left' }} options={gametypes_items} onBlur={save} onSelect={save} disabled={disabled} />
		</Form.Item>
	);
}

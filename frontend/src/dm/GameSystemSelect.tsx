import { createSchemaFieldRule } from 'antd-zod';
import { getZObject } from 'common';
import Form from 'antd/es/form';
import Select from 'antd/es/select';
import { type GameSystemListItem, type GameListItem, gameSystemSchema } from 'common/schema';
import { getListQueries, WrapCRUD } from '../CRUD.js';

const createFormRule = createSchemaFieldRule(getZObject(gameSystemSchema));

export default function GameSystemSelect({ save, disabled }: { save: () => void; disabled: boolean }) {
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
			<Select style={{ textAlign: 'left' }} options={gamesystems_items} onBlur={save} onSelect={save} loading={loading} disabled={disabled} />
		</Form.Item>
	);
}

import { createSchemaFieldRule } from 'antd-zod';
import { getZObject } from 'common';
import Form from 'antd/es/form';
import Select from 'antd/es/select';
import { type GameSystemListItem, type GameUpdateItem, gameSystemSchema } from 'common/schema';
import { useFetchQuery, WrapCRUD } from '../../lib/CRUD';
import { useBotMessage } from '../../components/BotMessage';
import { Tooltip } from '../../components/Tooltip';

export default function GameSystemSelect({ save, disabled, create }: { save: () => void; disabled: boolean; create: boolean }) {
	const result = useFetchQuery<GameSystemListItem[]>('/api/gamesystem', 'gamesystem');
	const gamesystems: GameSystemListItem[] = result.isSuccess ? result.data : [];
	const loading = result.isFetching;

	// FIXME - do we need the WrapCRUD spinner here, or is loading component enough
	return (
		<WrapCRUD result={result}>
			<GameSystemsSelectHTML create={create} gamesystems={gamesystems} save={save} loading={loading} disabled={disabled} />
		</WrapCRUD>
	);
}

function GameSystemsSelectHTML({
	gamesystems,
	save,
	loading,
	disabled,
	create
}: {
	gamesystems: GameSystemListItem[];
	save: () => void;
	loading: boolean;
	disabled: boolean;
	create: boolean;
}) {
	const { botMessage } = useBotMessage();
	const createFormRule = createSchemaFieldRule(getZObject(create ? gameSystemSchema.partial() : gameSystemSchema));
	const gamesystems_items = gamesystems.map((system) => {
		return { value: system.name, label: <span>{system.description}</span> };
	});
	const tooltip = 'TOOLTIP_POST_GAME_GAMESYSTEM';
	const message = botMessage('LABEL_POST_GAME_GAMESYSTEM');
	return (
		<Form.Item<GameUpdateItem> label={<Tooltip messageKey={tooltip}>{message}</Tooltip>} name="gamesystem" rules={[createFormRule]}>
			<Select style={{ textAlign: 'left' }} options={gamesystems_items} onBlur={save} onSelect={save} loading={loading} disabled={disabled} />
		</Form.Item>
	);
}

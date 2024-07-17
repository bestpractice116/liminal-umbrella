import { useState, createRef } from 'react';
import { FormRef } from 'rc-field-form/es/interface.js';
import { useParams } from 'react-router-dom';
import { PostGameForm } from './NewGame';
import { type GameListItem, GameSchema } from 'common/schema';
import { getFetchQuery, getUpdateMutation } from '../CRUD.js';
import { getZObject } from 'common';

export default function ViewGame() {
	const { key } = useParams();
	const result = getFetchQuery<GameListItem>(`/api/gamesessions/${key}`, `gamesessions/${key}`);

	const save = () => {};
	const formRef = createRef<FormRef>();
	const [isCreating, setIsCreating] = useState(false);
	const updateMutation = getUpdateMutation(`/api/gamesessions/${key}`, `gamesessions/${key}`, setIsCreating, () => {
		//console.log('updated');
	});

	console.log('RESULT DATA ', result.data!);
	if (!result.data) {
		return <div>loading</div>;
	}
	const res = getZObject(GameSchema.read).partial().safeParse(result.data);
	console.log('RES', res);
	return (
		<div>
			View one game: {key}
			<br />
			This page will contain the details / ability to edit things about an existing game you have already posted, and saving edits will update
			the Discord listings
			<PostGameForm
				mutation={updateMutation}
				initialvalues={res.data!}
				isLoading={isCreating || result.isFetching}
				formRef={formRef}
				save={save}
				setIsCreating={setIsCreating}
			/>
		</div>
	);
}

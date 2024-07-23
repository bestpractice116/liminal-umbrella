import { useState, createRef } from 'react';
import { FormRef } from 'rc-field-form/es/interface.js';
import { useParams } from 'react-router-dom';
import { type GameListItem, GameSchema } from 'common/schema';
import { getFetchQuery, getUpdateMutation } from '../CRUD.js';
import { getZObject } from 'common';
import dayjs from 'dayjs';
import PostGameForm from './PostGameForm.js';
import Table from 'antd/es/table';
import { type DefaultColumns } from '../CRUD.js';
import FindUserSearchBox from './FindUser.js';
import Typeography from 'antd/es/typography';
import UserRecord, { type AutoCompleteUser } from './UserRecord.js';
import { DeleteOutlined } from '@ant-design/icons';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { useMutation } from '@tanstack/react-query';

const Title = Typeography.Title;

type RemoveUserFromGameParameters = {
	key: string;
};

function UsersSignedUpTable({ users }: { users: AutoCompleteUser[] }) {
	const removeUserFromGameMutation = useMutation({
		mutationFn: (r: RemoveUserFromGameParameters) => {
			return fetch(
				'/api/gamesessionremove0user',
				{
					method: FetchMethods.Delete,
					body: JSON.stringify(r),
					headers: {
						'Content-Type': 'application/json'
					}
				},
				FetchResultTypes.JSON
			);
		}
	});
	const columns: DefaultColumns = [
		{
			title: 'Name',
			dataIndex: 'nickname',
			key: 'nickname',
			render: (_, record) => {
				return <UserRecord user={record as AutoCompleteUser} />;
			}
		},
		{
			title: 'Delete',
			dataIndex: 'delete',
			key: 'delete',
			render: (_, record) => {
				return (
					<DeleteOutlined
						onClick={() => {
							removeUserFromGameMutation.mutate({ key: record.key });
						}}
					/>
				);
			}
		}
	];
	return (
		<>
			<Title>Signed up Players</Title>
			<Table dataSource={users} columns={columns} />
		</>
	);
}

export default function ViewGame() {
	const { key } = useParams();
	const result = getFetchQuery<GameListItem>(`/api/gamesessions/${key}`, `gamesessions/${key}`);

	const save = () => {};
	const formRef = createRef<FormRef>();
	const [isCreating, setIsCreating] = useState(false);
	const updateMutation = getUpdateMutation(`/api/gamesessions`, `gamesessions/${key}`, setIsCreating, () => {
		console.log('updated');
	});

	if (!result.data) {
		return <div>loading</div>;
	}
	// FIXME - clean this up
	const res = getZObject(GameSchema.read).partial().safeParse(result.data);
	const initialValues = res.data!;
	initialValues.date = initialValues.starttime.clone().hour(12).minute(0).second(0).millisecond(0);
	const now = dayjs(Date.now());
	const editable = initialValues.starttime > now;
	return (
		<div>
			This page will contain the details / ability to edit things about an existing game you have already posted, and saving edits will update
			the Discord listings
			<PostGameForm
				mutation={updateMutation}
				initialvalues={initialValues}
				isLoading={isCreating || result.isFetching}
				formRef={formRef}
				save={save}
				setIsCreating={setIsCreating}
				createForm={false}
				disabled={!editable}
			/>
			<UsersSignedUpTable users={res.data!.signedupplayers as AutoCompleteUser[]} />
			<FindUserSearchBox exclude={res.data!.signedupplayers.map((player: AutoCompleteUser) => player.nickname)} />
		</div>
	);
}

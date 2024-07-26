import { useState, createRef } from 'react';
import { FormRef } from 'rc-field-form/es/interface.js';
import { useParams, useNavigate } from 'react-router-dom';
import { type GameListItem, type GameSessionUserSignupDelete, GameSchema } from 'common/schema';
import { getDeleteMutation, getFetchQuery, getUpdateMutation } from '../CRUD.js';
import { getZObject } from 'common';
import dayjs from '../dayjs.js';
import PostGameForm from './PostGameForm.js';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Collapse from 'antd/es/collapse';
import Panel from 'antd/es/collapse/CollapsePanel.js';
import List from 'antd/es/list';
import { type DefaultColumns } from '../CRUD.js';
import FindUserSearchBox from './FindUser.js';
import Popconfirm from 'antd/es/popconfirm';
import { LinkOutlined } from '@ant-design/icons';
import UserRecord, { type AutoCompleteUser } from './UserRecord.js';
import { DeleteOutlined } from '@ant-design/icons';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import NotFound from '../NotFound.js';
import { useErrorBoundary } from '../ErrorFallback';
import { AnyObject } from 'antd/es/_util/type.js';

function UsersSignedUpTable({
	deleteDisabled,
	gameSessionKey,
	users
}: {
	deleteDisabled: boolean;
	gameSessionKey: number;
	users: AutoCompleteUser[];
}) {
	const queryClient = useQueryClient();
	const removeUserFromGameMutation = useMutation({
		mutationFn: (r: GameSessionUserSignupDelete) => {
			return fetch(
				'/api/gamesessionusersignups',
				{
					method: FetchMethods.Delete,
					body: JSON.stringify(r),
					headers: {
						'Content-Type': 'application/json'
					}
				},
				FetchResultTypes.JSON
			).then((data) => {
				queryClient.invalidateQueries({ queryKey: ['gamesessions', `${r.gameSessionKey}`] });
				return data;
			});
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
		}
	];
	if (!deleteDisabled) {
		columns.push({
			title: 'Delete',
			dataIndex: 'delete',
			key: 'delete',
			render: (_, record) => {
				return (
					<Popconfirm
						title="Remove player from game?"
						onConfirm={() => removeUserFromGameMutation.mutate({ userKey: record.key, gameSessionKey })}
					>
						<a>
							<DeleteOutlined />
						</a>
					</Popconfirm>
				);
			}
		});
	}
	return <Table dataSource={users} columns={columns} />;
}

function GameLinks({ data }: { data: GameListItem }) {
	const listData = [
		{ text: 'Game Listing', href: data.gameListingsMessageLink },
		{ text: 'Event', href: data.eventLink },
		{ text: 'Game chat', href: data.channelLink }
	];
	return (
		<List
			size="large"
			dataSource={listData}
			renderItem={(item) => (
				<List.Item>
					<a href={item.href} target="_blank">
						<LinkOutlined />
						&nbsp;
						{item.text}
					</a>
				</List.Item>
			)}
		/>
	);
}

export default function ViewGame() {
	const { showBoundary } = useErrorBoundary();
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const findSchema = GameSchema.find!;
	const { data, error } = findSchema.safeParse(useParams());
	if (error) {
		return <NotFound />;
	}
	const key = data.key as number;
	const queryKey = ['gamesessions', key];
	const result = getFetchQuery<GameListItem>(`/api/gamesessions/${key}`, queryKey);

	const save = () => {};
	const formRef = createRef<FormRef>();
	const [isCreating, setIsCreating] = useState(false);
	const updateMutation = getUpdateMutation(`/api/gamesessions`, ['gamesessions', key], setIsCreating, () => {
		console.log('updated');
	});
	const deleteMutation = getDeleteMutation(
		'/api/gamesessions',
		(_isMutating: boolean) => {},
		(_data: any, row: any) => {
			queryClient.removeQueries({ queryKey: ['gamesessions', `${row.key}`] });
			navigate('/dm/viewgames');
		}
	);

	if (!result.data) {
		return <div>loading</div>;
	}
	let initialValues: AnyObject = {};
	let editable = false;
	let signedUpUsers: AutoCompleteUser[] = [];
	let full = false;
	if (result.isSuccess) {
		const res = getZObject(GameSchema.read).safeParse(result.data);
		if (res.error) showBoundary(res.error);
		initialValues = res.data!;
		initialValues.date = initialValues?.starttime?.clone().hour(12).minute(0).second(0).millisecond(0);
		const now = dayjs(Date.now());
		editable = initialValues?.starttime && initialValues.starttime > now;
		signedUpUsers = initialValues?.signedupplayers;
		full = initialValues?.maxplayers <= signedUpUsers?.length;
	}
	return (
		<Collapse bordered={false} defaultActiveKey={['1']}>
			<Panel style={{ textAlign: 'left' }} header="Links" key="1">
				<GameLinks data={initialValues as GameListItem} />
			</Panel>
			<Panel style={{ textAlign: 'left' }} header="Edit game" key="2">
				<PostGameForm
					mutation={updateMutation}
					initialvalues={initialValues}
					isLoading={isCreating || result.isFetching}
					formRef={formRef}
					save={save}
					setIsCreating={setIsCreating}
					createForm={false}
					disabled={!editable}
					submitButtonText={'Update Game Listing'}
				/>
				<div style={{ float: 'right', position: 'relative', top: -55 }}>
					<Popconfirm title="Are you sure you wish to cancel this game?" onConfirm={() => deleteMutation.mutate({ key })}>
						<a>
							<Button danger disabled={isCreating} icon={<DeleteOutlined />}>
								Cancel game
							</Button>
						</a>
					</Popconfirm>
				</div>
			</Panel>
			<Panel style={{ textAlign: 'left' }} header="Signed up users" key="3">
				<UsersSignedUpTable deleteDisabled={!editable || isCreating} gameSessionKey={key} users={signedUpUsers} />

				{editable ? (
					<>
						Add user:&nbsp;
						<FindUserSearchBox
							disabled={full || isCreating}
							gameSessionKey={key}
							exclude={signedUpUsers.map((player: AutoCompleteUser) => player.key)}
						/>
					</>
				) : (
					<></>
				)}
			</Panel>
		</Collapse>
	);
}

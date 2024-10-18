import { createRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { type GameReadItem, type GameSessionUserSignupDelete, GameSchema } from 'common/schema';
import { getZObject } from 'common';
import dayjs from 'antd/node_modules/dayjs';
import PostGameForm from './PostGameForm';
import Table from 'antd/es/table';
import Button from 'antd/es/button';
import Collapse from 'antd/es/collapse';
import Panel from 'antd/es/collapse/CollapsePanel';
import List from 'antd/es/list';
import { FormInstance } from 'antd/es/form';
import { type DefaultColumns, zodErrorConvertor, useDeleteMutation, useFetchQuery, useUpdateMutationAndUpdateQueryData } from '../../lib/CRUD';
import FindUserSearchBox from './FindUser.js';
import Popconfirm from 'antd/es/popconfirm';
import { LinkOutlined, DeleteOutlined } from '@ant-design/icons';
import UserRecord, { type AutoCompleteUser } from './UserRecord';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotFound } from '..//NotFound';
import { useErrorBoundary } from '../../components/ErrorBoundary';
import { AnyObject } from 'antd/es/_util/type.js';
import { GameForm } from './types.js';

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
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                queryClient.invalidateQueries({ queryKey: ['gamesessions', `${r.gameSessionKey}`] });
                return data;
            });
        }
    });
    const columns: DefaultColumns<AutoCompleteUser> = [
        {
            title: 'Name',
            dataIndex: 'nickname',
            key: 'nickname',
            render: (_, record) => {
                return <UserRecord user={record as unknown as AutoCompleteUser} />;
            },
            ellipsis: true
        }
    ];
    if (!deleteDisabled) {
        columns.push({
            title: 'Delete',
            dataIndex: 'delete',
            key: 'delete',
            ellipsis: true,
            render: (_, record) => {
                return (
                    <Popconfirm
                        title="Remove player from game?"
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                        onConfirm={() => { removeUserFromGameMutation.mutate({ userKey: record.key, gameSessionKey }); }}
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

function GameLinks({ data }: { data: GameReadItem }) {
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

export function ViewGame() {
    const { showBoundary } = useErrorBoundary();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const findSchema = GameSchema.find!;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { data, error } = findSchema.safeParse(useParams());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const key = data.key as number;
    const queryKey = ['gamesessions', key];
    const result = useFetchQuery<GameReadItem>(`/api/gamesessions/${key}`, queryKey);
    const { updateMutation, isUpdating } = useUpdateMutationAndUpdateQueryData<GameForm>('/api/gamesessions', ['gamesessions', key])
    const { deleteMutation } = useDeleteMutation(
        '/api/gamesessions',
        // FIXME - why can't we use the built in query mangler
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (_data: any, row: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            queryClient.removeQueries({ queryKey: ['gamesessions', `${row.key}`] });
            navigate('/dm/viewgames');
        }
    );
    // eslint-disable-next-line @eslint-react/no-create-ref
    const formRef = createRef<FormInstance<GameForm>>();
    if (error) {
        return <NotFound />;
    }

    const save = () => {};

    if (!result.data) {
        return <div>loading</div>;
    }
    let initialValues: AnyObject | undefined;
    let editable = false;
    let signedUpUsers: AutoCompleteUser[] = [];
    let full = false;
    if (result.isSuccess) {
        try {
            initialValues = getZObject(GameSchema.read).parse(result.data) as GameReadItem;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (e: any) {
            console.log('error ', e);
            showBoundary(zodErrorConvertor(e));
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        if (initialValues) {
            initialValues.starttime = dayjs(initialValues.starttime as Date);
            initialValues.endtime = dayjs(initialValues.endtime as Date);
            initialValues.date = dayjs(initialValues.starttime as Date).clone().hour(12).minute(0).second(0).millisecond(0);
        }
        const now = dayjs(Date.now());
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        editable = initialValues?.starttime && initialValues.starttime > now;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        signedUpUsers = initialValues?.signedupplayers || [];
        full = initialValues?.maxplayers <= signedUpUsers.length;
    }
    const excludeFindUsers = signedUpUsers.map((player: AutoCompleteUser) => player.key);
    if (initialValues?.owner) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        excludeFindUsers.push(initialValues.owner.key);
    }
    return (
        <Collapse bordered={false} defaultActiveKey={['1']}>
            <Panel style={{ textAlign: 'left' }} header="Links" key="1">
                <GameLinks data={initialValues as GameReadItem} />
            </Panel>
            <Panel style={{ textAlign: 'left' }} header="Edit game" key="2">
                <PostGameForm
                    mutation={updateMutation}
                    initialValues={initialValues ?? {}}
                    isLoading={isUpdating || result.isFetching}
                    formRef={formRef}
                    save={save}
                    createForm={false}
                    disabled={!editable}
                    submitButtonText={'Update Game Listing'}
                />
                <div style={{ float: 'right', position: 'relative', top: -55 }}>
                    <Popconfirm title="Are you sure you wish to cancel this game?" onConfirm={() => { deleteMutation.mutate({ key }); }}>
                        <a>
                            <Button danger disabled={isUpdating} icon={<DeleteOutlined />}>
                                Cancel game
                            </Button>
                        </a>
                    </Popconfirm>
                </div>
            </Panel>
            <Panel style={{ textAlign: 'left' }} header="Signed up users" key="3">
                <UsersSignedUpTable deleteDisabled={!editable || isUpdating} gameSessionKey={key} users={signedUpUsers} />

                {editable ? (
                    <>
                        Add user:&nbsp;
                        <FindUserSearchBox disabled={full || isUpdating} gameSessionKey={key} exclude={excludeFindUsers} />
                    </>
                ) : (
                    <></>
                )}
            </Panel>
        </Collapse>
    );
}

import { useState, createRef } from 'react';
import Button from 'antd/es/button';
import dayjs from 'common';
import type { Dayjs } from 'common';
import { type GameCreateItem, type NewGameListItem, GameSchema, GameType, GameUpdateItem, NewGameSchema } from 'common/schema';
import { MutationReturn, useCreateMutation, useFetchQuery, useUpdateMutation } from '../../lib/CRUD';
import { Spin } from '../../components/Spin';
import Form, { FormInstance } from 'antd/es/form';
import { getZObject } from 'common';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import PostGameForm from './PostGameForm.js';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useErrorBoundary } from '../../components/ErrorBoundary';
import BotMessage from '../../components/BotMessage';
import { GameForm } from './types.js';
import { SafeParseReturnType } from 'zod';

export function NewGame() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @eslint-react/no-create-ref
    const formRef = createRef<FormInstance<GameUpdateItem & { date?: Dayjs }>>();
    return <NewGameInner formRef={formRef} />;
}

function NewGameInner({ formRef }: { formRef: React.RefObject<FormInstance<GameUpdateItem & { date?: Dayjs }>> }) {
    const { showBoundary } = useErrorBoundary();
    // FIXME - this name is bad as it isn't just creating
    const [postId, setPostId] = useState(-1);
    const result = useFetchQuery<NewGameListItem[]>('/api/game', 'game');
    const queryClient = useQueryClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { createMutation, isCreating } = useCreateMutation<GameCreateItem, GameForm>('/api/game', 'game', (data: MutationReturn<NewGameListItem>) => {
        formRef.current!.setFieldValue('key', data.datum.key);
        // FIXME - why can't we use the built in one?
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(['game'], () => {
            return [data.datum];
        });
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { updateMutation, isUpdating } = useUpdateMutation('/api/game', (data: MutationReturn<GameForm>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(['game'], (_old: any) => {
            return [data.datum];
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let initialValues: Partial<GameForm> = {
        date: dayjs('12:00', 'HH:mm').add(14, 'days'),
        starttime: dayjs('18:00', 'HH:mm').add(14, 'days'),
        endtime: dayjs('22:00', 'HH:mm').add(14, 'days'),
        maxplayers: 4,
        type: 'oneshot' as GameType
    };
    let hasGame = false;
    if (result.isFetched && result.data && result.data.length >= 1) {
        // THe length should never be > 1, but lets try to work anyway.
        const res = getZObject(NewGameSchema.read.unwrap()).safeParse(result.data[0]) as SafeParseReturnType<unknown, GameForm>;
        if (!res.success) {
            console.error('error parsing NewGameSchea.read', res.error.format());
        } else {
            initialValues = res.data;
            initialValues.date = dayjs(initialValues.starttime).clone().hour(12).minute(0).second(0).millisecond(0);
            hasGame = true;
        }
    }
    if (!result.isFetched) {
        return <Spin spinning={true} />;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mutation: UseMutationResult<MutationReturn<GameForm>, Error, any, any> = createMutation;
    if (hasGame) {
        mutation = updateMutation;
    }
    const save = () => {
        if (!formRef.current) {
            return;
        }
        const data = formRef.current.getFieldsValue();
        delete data.date;
        mutation.mutate(data);
    };
    const postgame = () => {
        const data = formRef.current!.getFieldsValue();
        mutation.mutate(data, {
            onSuccess: () => {
                // FIXME pull this out to it's own function?
                    fetch(
                        '/api/gamepost',
                        {
                            method: FetchMethods.Post,
                            body: JSON.stringify({ key: data.key }),
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        },
                        FetchResultTypes.JSON
                    )
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        .then((data: unknown) => {
                            // FIXME - any
                            void queryClient.resetQueries(
                                {
                                    queryKey: ['game'],
                                    exact: true
                                },
                                { throwOnError: true }
                            );
                            setPostId((data as MutationReturn<GameForm>).datum.key);
                        })
                        .catch((e: unknown) => { showBoundary(e); })
                
            },
            onError: (e) => {
                throw e;
            }
        });
    };

    if (postId > 0) {
        return <Navigate to={`/dm/viewgame/${postId}`} />;
    }
    return (
        <PostGameForm
            isLoading={isCreating || isUpdating || result.isFetching}
            save={save}
            formRef={formRef}
            mutation={mutation}
            initialValues={initialValues}
        >
            <PostButton form={formRef} doPost={postgame} />
        </PostGameForm>
    );
}

 
function PostButton({ form, doPost }: { form: React.RefObject<FormInstance | undefined>; doPost: () => void }) {
    const values = Form.useWatch([], form.current ?? undefined) as GameForm | undefined;
    if (!form.current) return <></>;
    const hasFieldErrors = form.current.getFieldsError().filter((field) => field.errors.length > 0).length > 0;
    const isPostable = !hasFieldErrors && getZObject(GameSchema.create!).safeParse(values).success;
    return (
        <Button type="primary" icon={<CheckCircleOutlined />} disabled={!isPostable} onClick={doPost}>
            <BotMessage messageKey="BUTTON_NEW_GAME_POST_GAME" />
        </Button>
    );
}

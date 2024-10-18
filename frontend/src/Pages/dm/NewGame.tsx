import { useState, createRef } from 'react';
import Button from 'antd/es/button';
import dayjs from 'antd/node_modules/dayjs';
import { type GameCreateItem, type NewGameListItem, GameSchema, NewGameSchema } from 'common/schema';
import { useCreateMutation, useFetchQuery, useUpdateMutation } from '../../lib/CRUD';
import { Spin } from '../../components/Spin';
import Form, { FormInstance } from 'antd/es/form';
import { getZObject } from 'common';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import PostGameForm from './PostGameForm.js';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useErrorBoundary } from '../../components/ErrorBoundary';
import BotMessage from '../../components/BotMessage';

export function NewGame() {
	const { showBoundary } = useErrorBoundary();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const formRef = createRef<FormInstance<GameCreateItem & { date?: any }>>();
	// FIXME - this name is bad as it isn't just creating
	const [postId, setPostId] = useState(-1);
	const result = useFetchQuery<NewGameListItem[]>('/api/game', 'game');
	const queryClient = useQueryClient();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { createMutation, isCreating } = useCreateMutation('/api/game', 'game', (data: any) => {
		formRef.current!.setFieldValue('key', data!.datum!.key);
		// FIXME - why can't we use the built in one?
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		queryClient.setQueryData(['game'], (_old: any) => {
			return [data.datum];
		});
	});
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const { updateMutation, isUpdating } = useUpdateMutation('/api/game', (data: any) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		queryClient.setQueryData(['game'], (_old: any) => {
			return [data.datum];
		});
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let initialValues: any = {
		date: dayjs('12:00', 'HH:mm').add(14, 'days'),
		starttime: dayjs('18:00', 'HH:mm'),
		endtime: dayjs('22:00', 'HH:mm'),
		maxplayers: 4,
		type: 'oneshot'
	};
	let hasGame = false;
	if (result.isFetched && result.data && result.data.length >= 1) {
		// THe length should never be > 1, but lets try to work anyway.
		const res = getZObject(NewGameSchema.read).safeParse(result.data[0]);
		if (!res.success) {
			console.error('error parsing NewGameSchea.read', res.error.format());
		} else {
			initialValues = res.data;
			initialValues.date = initialValues?.starttime?.clone().hour(12).minute(0).second(0).millisecond(0);
			hasGame = true;
		}
	}
	if (!result.isFetched) {
		return <Spin spinning={true} fullscreen />;
	}
	let mutation = createMutation;
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
				return (
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
						.then((data: any) => {
							// FIXME - any
							queryClient.resetQueries(
								{
									queryKey: ['game'],
									exact: true
								},
								{ throwOnError: true }
							);
							setPostId(data.datum.key);
						})
						.catch((e) => { showBoundary(e); })
				);
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
	const values = Form.useWatch([], form.current || undefined);
	if (!form.current) return <></>;
	const hasFieldErrors = form.current.getFieldsError().filter((field) => field.errors.length > 0).length > 0;
	const isPostable = !hasFieldErrors && getZObject(GameSchema.create!).safeParse(values).success;
	return (
		<Button type="primary" icon={<CheckCircleOutlined />} disabled={!isPostable} onClick={doPost}>
			<BotMessage messageKey="BUTTON_NEW_GAME_POST_GAME" />
		</Button>
	);
}

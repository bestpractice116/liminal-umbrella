import { useState, createRef } from 'react';
import Form from 'antd/es/form';
import { FormRef } from 'rc-field-form/es/interface.js';
import Button from 'antd/es/button';
import dayjs from '../dayjs.js';
import { type GameListItem, GameSchema } from 'common/schema';
import { getCreateMutation, getFetchQuery, getUpdateMutation } from '../CRUD.js';
import Spin from 'antd/es/spin';
import { getZObject } from 'common';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import { useErrorBoundary } from '../ErrorFallback';
import { useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import PostGameForm from './PostGameForm.js';

export default function PostGame() {
	const { showBoundary } = useErrorBoundary();
	const formRef = createRef<FormRef>();
	// FIXME - this name is bad as it isn't just creating
	const [isCreating, setIsCreating] = useState(false);
	const [postId, setPostId] = useState(-1);
	const result = getFetchQuery<Array<GameListItem>>('/api/game', 'game');
	const queryClient = useQueryClient();
	const createMutation = getCreateMutation('/api/game', 'game', setIsCreating, (data: any) => {
		formRef.current!.setFieldValue('key', data!.datum!.key);
		queryClient.setQueryData(['game'], (old: any) => {
			return [...(old || []), data.datum];
		});
	});
	const updateMutation = getUpdateMutation('/api/game', 'game', setIsCreating, () => {
		//console.log('updated');
	});

	let initialvalues: any = {
		starttime: dayjs('18:00', 'HH:mm'),
		endtime: dayjs('22:00', 'HH:mm'),
		maxplayers: 4,
		type: 'oneshot'
	};
	let hasGame = false;
	let isPostable = false;
	if (result.isFetched && result.data && result.data.length == 1) {
		const res = getZObject(GameSchema.read!).partial().safeParse(result.data[0]);
		if (!res.success) {
			console.log(res.error);
		} else {
			initialvalues = res.data;
			hasGame = true;
			isPostable = getZObject(GameSchema.create!).safeParse(result.data[0]).success;
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
		const data = formRef.current!.getFieldsValue();
		setIsCreating(true);
		mutation.mutate(data, {
			// FIXME - why do we have some logic in getCreateMutation and some here.
			onSuccess: (_data) => {
				setIsCreating(false);
			},
			onError: (_e) => {
				setIsCreating(false);
			}
		});
	};
	const postgame = () => {
		const data = formRef.current!.getFieldsValue();
		setIsCreating(true);
		mutation.mutate(data, {
			onSuccess: () => {
				// FIXME pull this out to it's own function?
				return fetch(
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
					.then((data: any) => {
						// FIXME - any
						queryClient.resetQueries(
							{
								queryKey: ['game'],
								exact: true
							},
							{ throwOnError: true }
						);
						setIsCreating(false);
						setPostId(data.datum.key);
					})
					.catch((e) => showBoundary(e));
			},
			onError: (e) => {
				setIsCreating(false);
				throw e;
			}
		});
	};

	if (postId > 0) {
		return <Navigate to={`/dm/viewgame/${postId}`} />;
	}

	return (
		<PostGameForm
			isLoading={isCreating || result.isFetching}
			save={save}
			setIsCreating={setIsCreating}
			formRef={formRef}
			mutation={mutation}
			initialvalues={initialvalues}
		>
			<Form.Item label="Post">
				<Button disabled={!isPostable} onClick={postgame}>
					Post
				</Button>
			</Form.Item>
		</PostGameForm>
	);
}

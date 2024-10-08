import { useQuery } from '@tanstack/react-query';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { MessageContext } from './hooks';
import { MessagesData, MessagesFetchResult, MessagesQueryData, MessagesQueryDatum, MessagesQueryError, MessagesQueryResult } from './types';
import { useState, useEffect } from 'react';
import { Spin } from '../Spin';
import Layout, { Content } from 'antd/es/layout/layout';

async function fetchMessages(): Promise<MessagesFetchResult> {
	return fetch(
		'/api/botmessages',
		{
			method: 'GET'
		},
		FetchResultTypes.JSON
	);
}

function Loading() {
	return (
		<Layout>
			<Content>
				<Spin />
			</Content>
		</Layout>
	);
}

export function BotMessageProvider({ children }: { children: React.ReactNode }) {
	const [hasFetchedMessages, setHasFetchedMessages] = useState(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: MessagesQueryResult = useQuery<any, MessagesQueryError>({
		queryKey: ['botmessages'],
		queryFn: fetchMessages,
		notifyOnChangeProps: 'all',
		refetchOnWindowFocus: true,
		gcTime: Infinity,
		retry: true
	});
	useEffect(() => {
		if (result.failureCount > 0 || result.isFetched) setHasFetchedMessages(true);
	}, [result.failureCount, result.isFetching]);
	let data: MessagesData = {};
	if (result) {
		if (result.error || ((result.data || {}) as MessagesQueryError).error) {
			console.log('Got error fetching messages: ', result);
		}
		if (!hasFetchedMessages && result.isFetching) {
			return <Loading />;
		}
		data = ((result.data as MessagesQueryData) || []).reduce((acc: MessagesData, curr: MessagesQueryDatum) => {
			return { ...acc, [curr.name]: curr.value };
		}, {});
	}
	return <MessageContext.Provider value={data}>{children}</MessageContext.Provider>;
}

import { useQuery } from '@tanstack/react-query';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import Spin from 'antd/es/spin';
import Layout, { Content } from 'antd/es/layout/layout';
import { MessageContext, useBotMessage } from './hooks';
import { MessagesData, MessagesFetchResult, MessagesQueryData, MessagesQueryDatum, MessagesQueryError, MessagesQueryResult } from './types';

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
				<Spin tip="Loading" size="large" fullscreen={true}>
					&nbsp;
				</Spin>
			</Content>
		</Layout>
	);
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const result: MessagesQueryResult = useQuery<any, MessagesQueryError>({
		queryKey: ['botmessages'],
		queryFn: fetchMessages,
		notifyOnChangeProps: 'all',
		retry: 0
	});
	let data: MessagesData = {};
	if (result) {
		if (result.error || ((result.data || {}) as MessagesQueryError).error) {
			throw result;
		}
		if (result.isFetching) {
			return <Loading />;
		}
		data = ((result.data as MessagesQueryData) || []).reduce((acc: MessagesData, curr: MessagesQueryDatum) => {
			return { ...acc, [curr.key]: curr.value };
		}, {});
	}
	return <MessageContext.Provider value={data}>{children}</MessageContext.Provider>;
}

type BotMessageProps = {
	messageKey: string;
	defaultMessage?: string | null | undefined;
};

export default function BotMessage(props: BotMessageProps) {
	const {botMessage} = useBotMessage();
	return botMessage(props.messageKey, props.defaultMessage);
}

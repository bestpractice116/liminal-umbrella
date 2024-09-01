import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import Spin from 'antd/es/spin';
import Layout, { Content } from 'antd/es/layout/layout';

export type MessagesData = { [key: string]: string };

export type MessagesQueryDatum = {
	key: number;
	name: string;
	value: string;
};

export type MessagesQueryData = MessagesQueryDatum[];

export type MessagesQueryError = {
	error: string;
};

export type MessagesFetchResult = MessagesQueryData | MessagesQueryError;

export type MessagesQueryResult = {
	data: MessagesFetchResult | undefined;
	error: any;
	isError: boolean;
	isFetching: boolean;
	isFetched: boolean;
	isPending: boolean;
	isLoading: boolean;
	isSuccess: boolean;
};

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

export const MessageContext = createContext({} as MessagesData);
export function MessageProvider({ children }: { children: React.ReactNode }) {
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
	return botMessage(props.messageKey, props.defaultMessage);
}

export function botMessage(messageKey: string, defaultMessage?: string | null | undefined) {
	const messages = useContext(MessageContext);
	const defaultM = typeof defaultMessage === 'undefined' ? messageKey : defaultMessage;
	return messageKey in messages ? messages['key'] : defaultM;
}

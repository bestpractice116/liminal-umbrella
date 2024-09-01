import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';
import { fetch, FetchResultTypes } from '@sapphire/fetch';

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
		data = ((result.data as MessagesQueryData) || []).reduce((acc: MessagesData, curr: MessagesQueryDatum) => {
			return { ...acc, [curr.key]: curr.value };
		}, {});
	}
	return <MessageContext.Provider value={data}>{children}</MessageContext.Provider>;
}

type BotMessageProps = {
	key: string;
	default?: string | null | undefined;
};

export default function BotMessage(props: BotMessageProps) {
	const messages = useContext(MessageContext);
	const defaultMessage = typeof props.default === 'undefined' ? props.key : props.default;
	return props.key in messages ? messages['key'] : defaultMessage;
}

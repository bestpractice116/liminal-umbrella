export type MessagesData = Record<string, string>;

export interface MessagesQueryDatum {
	key: number;
	name: string;
	value: string;
}

export type MessagesQueryData = MessagesQueryDatum[];

export interface MessagesQueryError {
	error: string;
}

export type MessagesFetchResult = MessagesQueryData | MessagesQueryError;

export interface MessagesQueryResult {
	data: MessagesFetchResult | undefined;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error: any;
	isError: boolean;
	isFetching: boolean;
	isFetched: boolean;
	isPending: boolean;
	isLoading: boolean;
	isSuccess: boolean;
	failureCount: number;
}

export interface BotMessageProps {
	messageKey: string;
}

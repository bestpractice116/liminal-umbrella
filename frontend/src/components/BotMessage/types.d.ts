
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

import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { AutoComplete, AutoCompleteProps } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import UserRecord from './UserRecord.js';
import { type AutoCompleteUser } from './UserRecord.js';

type ListOfAutoCompleteUsers = Array<AutoCompleteUser>;

type AddUserToGameParameters = {
	gameSessionKey: number;
	userKey: string;
};

function findUserFromKey(key: string, users: ListOfAutoCompleteUsers): AutoCompleteUser | undefined {
	return users.find((user) => user.key == key);
}

function SearchBox({ gameSessionKey, exclude = [] }: { gameSessionKey: number; exclude?: string[] }) {
	const [value, setValue] = useState('');
	const [searchText] = useDebounce(value, 250);

	const result = useQuery({
		queryKey: ['user', searchText],
		queryFn: (): Promise<ListOfAutoCompleteUsers> => {
			return fetch(
				'/api/userautocomplete?' +
					new URLSearchParams({
						searchText
					}),
				FetchResultTypes.JSON
			);
		},
		throwOnError: true,
		enabled: searchText.length >= 2
	});
	const addUserToGameMutation = useMutation({
		mutationFn: (r: AddUserToGameParameters) => {
			return fetch(
				'/api/gamesessionusersignups',
				{
					method: FetchMethods.Post,
					body: JSON.stringify(r),
					headers: {
						'Content-Type': 'application/json'
					}
				},
				FetchResultTypes.JSON
			);
		}
	});

	const data = result.data || [];
	const opt: AutoCompleteProps['options'] = data.map((user: AutoCompleteUser) => {
		return { label: <UserRecord user={user} size="small" />, value: user.key };
	});

	const onSelect = (userKey: string) => {
		addUserToGameMutation.mutate({
			gameSessionKey,
			userKey
		});
	};
	const onChange = (userKey: string) => {
		const user = findUserFromKey(userKey, data);
		if (user) setValue(user.nickname);
	};
	return (
		<>
			<AutoComplete
				value={value}
				options={opt}
				style={{ width: 300 }}
				onSelect={onSelect}
				onSearch={setValue}
				onChange={onChange}
				placeholder="Add user"
				filterOption={(_inputValue, option) => !exclude.find((maybeExclude) => maybeExclude == option?.value)}
			/>
			<br />
			<br />
		</>
	);
}

export default SearchBox;

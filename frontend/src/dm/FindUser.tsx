import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { AutoComplete, AutoCompleteProps } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import UserRecord from './UserRecord.js';
import { type AutoCompleteUser } from './UserRecord.js';
type ListOfAutoCompleteUsers = Array<AutoCompleteUser>;

type AddUserToGameParameters = {
	gameSessionId: number;
	userId: string;
};

function SearchBox({ exclude = [] }: { exclude?: string[] }) {
	const [value, setValue] = useState('');
	const [searchText] = useDebounce(value, 250);

	const result = useQuery({
		queryKey: ['user', searchText],
		queryFn: (): Promise<ListOfAutoCompleteUsers> => {
			return fetch('/api/userautocomplete', FetchResultTypes.JSON);
		},
		throwOnError: true,
		enabled: searchText.length > 2
	});
	const addUserToGameMutation = useMutation({
		mutationFn: (r: AddUserToGameParameters) => {
			return fetch(
				'/api/gamesessionadduser',
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
		return { label: <UserRecord user={user} size="small" />, value: user.nickname };
	});

	const onSelect = (nickname: string) => {
		console.log('onSelect', nickname);
		addUserToGameMutation.mutate({
			gameSessionId: 2,
			userId: 'ho8ojoe'
		});
	};

	return (
		<>
			<AutoComplete
				value={value}
				options={opt}
				style={{ width: 200 }}
				onSelect={onSelect}
				onSearch={(text) => setValue(text)}
				onChange={setValue}
				placeholder="Add user"
				filterOption={(_inputValue, option) => !exclude.find((maybeExclude) => maybeExclude == option?.value)}
			/>
			<br />
			<br />
		</>
	);
}

export default SearchBox;

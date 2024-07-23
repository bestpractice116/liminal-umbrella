import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { AutoComplete, AutoCompleteProps } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch';
import UserRecord from './UserRecord.js';
import { type AutoCompleteUser } from './UserRecord.js';
type ListOfAutoCompleteUsers = Array<AutoCompleteUser>;

function SearchBox({ exclude = [] }: { exclude?: string[] }) {
	const [value, setValue] = useState('');
	const [searchText] = useDebounce(value, 250);
	console.log('searchText is ', searchText);

	const result = useQuery({
		queryKey: ['user', searchText],
		queryFn: (): Promise<ListOfAutoCompleteUsers> => {
			return fetch('/api/userautocomplete', FetchResultTypes.JSON);
		},
		throwOnError: true,
		enabled: searchText.length > 2
	});

	const data = result.data || [];
	console.log('result is ', result);
	const opt: AutoCompleteProps['options'] = data.map((user: AutoCompleteUser) => {
		return { label: <UserRecord user={user} size="small" />, value: user.nickname };
	});
	console.log('Options ', opt);

	const onSelect = (data: string) => {
		console.log('onSelect', data);
	};

	const onChange = (data: string) => {
		setValue(data);
	};

	return (
		<>
			<AutoComplete
				value={value}
				options={opt}
				style={{ width: 200 }}
				onSelect={onSelect}
				onSearch={(text) => setValue(text)}
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

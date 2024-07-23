import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { AutoComplete, AutoCompleteProps } from 'antd';
import { useQuery } from '@tanstack/react-query';

const mockVal = (str: string) => {
	console.log('Called mockVal for ', str);
	return () => {
		console.log('Do fetch');
		return new Promise((resolve, _reject) => {
			setTimeout(() => {
				const ret = [
					{
						label: str.repeat(1),
						value: 1
					},
					{
						label: str.repeat(2),
						value: 2
					},
					{
						label: str.repeat(3),
						value: 3
					}
				];
				console.log('RESOLVE FETCH WITH', ret);
				resolve(ret);
			}, 500);
		});
	};
};

function SearchBox() {
	const [value, setValue] = useState('');
	const [searchText] = useDebounce(value, 250);
	console.log('searchText is ', searchText);
	const result = useQuery({ queryKey: ['user', searchText], queryFn: mockVal(searchText), enabled: searchText.length > 2 });

	console.log('result is ', result);
	const opt: AutoCompleteProps['options'] = (result.data as AutoCompleteProps['options']) || [];

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
			/>
			<br />
			<br />
		</>
	);
}

export default SearchBox;

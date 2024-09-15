import Spinner from 'antd/es/spin';

export function Spin() {
	return (
		<div style={{ width: '100%', display: 'flex' }}>
			<Spinner
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					margin: 'auto'
				}}
				size="large"
			/>
		</div>
	);
}

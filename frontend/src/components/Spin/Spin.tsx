import Spin from 'antd/es/spin';

export default function Spinner() {
	return (
		<div style={{ width: '100%', display: 'flex' }}>
			<Spin
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

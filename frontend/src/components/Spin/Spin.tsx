import Spinner from 'antd/es/spin';

export function Spin({ spinning = true }: { spinning?: boolean }) {
	return (
		<div style={{ width: '100%', display: 'flex' }}>
			<Spinner
				tip="Loading"
				spinning={spinning}
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					margin: 'auto'
				}}
				size="large"
			>
				&nbsp;
			</Spinner>
		</div>
	);
}

import Spinner from 'antd/es/spin';

export function Spin({ spinning = true, tip }: { spinning?: boolean, tip?: string }) {
    tip ||= 'Loading';
    return (
        <div style={{ display: spinning ? 'block' : 'none', top: 0, left: 0, position: 'absolute', height: '100vh', width: '100%', paddingTop: '50%', paddingBottom: '50%' }}>
            <Spinner
                tip={tip}
                spinning={spinning}
                style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    margin: 'auto',
                }}
                size="large"
                fullscreen
            >
                &nbsp;
            </Spinner>
        </div>
    );
}

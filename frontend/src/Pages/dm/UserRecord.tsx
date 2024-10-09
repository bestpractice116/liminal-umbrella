import Avatar, { type AvatarProps } from 'antd/es/avatar/avatar';
import { UserOutlined } from '@ant-design/icons';
import Typography from 'antd/es/typography';
import { Tooltip } from 'antd';
const { Text } = Typography;

export interface AutoCompleteUser {
	nickname: string;
	avatarURL: string;
	key: string;
	username: string;
}

export default function UserRecord({ user, size = 'large' }: { user: AutoCompleteUser; size?: AvatarProps['size'] }) {
	return (
		<div
			style={{
				width: 'calc(100%)',
				margin: 0,
				padding: 0,
				alignItems: 'center',
				justifyContent: 'space-between',
				overflow: 'hidden',
				whiteSpace: 'nowrap',
				textOverflow: 'ellipsis'
			}}
		>
			<Tooltip placement="topLeft" title={`${user.nickname} (${user.username})`}>
				<Avatar
					style={{ margin: 0, padding: 0, marginRight: '0.1em' }}
					icon={<UserOutlined />}
					src={user.avatarURL}
					shape="square"
					size={size}
					className="avatarIcon"
				/>
				{user.nickname}&nbsp;
				<Text disabled>({user.username})</Text>
			</Tooltip>
		</div>
	);
}

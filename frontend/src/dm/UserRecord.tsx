import Avatar, { type AvatarProps } from 'antd/es/avatar/avatar';
import { UserOutlined } from '@ant-design/icons';
import Typography from 'antd/es/typography';
const { Text } = Typography;

export type AutoCompleteUser = {
	nickname: string;
	avatarURL: string;
	key: string;
	username: string;
};

export default function UserRecord({ user, size = 'large' }: { user: AutoCompleteUser; size?: AvatarProps['size'] }) {
	return (
		<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
			<span>
				<Avatar
					icon={<UserOutlined />}
					src={user.avatarURL}
					style={{ marginRight: '20px' }}
					shape="square"
					size={size}
					className="avatarIcon"
				/>
				{user.nickname}
			</span>
			<Text disabled>({user.username})</Text>
		</div>
	);
}

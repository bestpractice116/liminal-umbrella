import Avatar, { type AvatarProps } from 'antd/es/avatar/avatar';
import { UserOutlined } from '@ant-design/icons';

export type AutoCompleteUser = {
	nickname: string;
	avatarURL: string;
	key: string;
};

export default function UserRecord({ user, size = 'large' }: { user: AutoCompleteUser; size?: AvatarProps['size'] }) {
	return (
		<span>
			<Avatar icon={<UserOutlined />} src={user.avatarURL} style={{ marginRight: '20px' }} shape="square" size={size} className="avatarIcon" />
			{user.nickname}
		</span>
	);
}

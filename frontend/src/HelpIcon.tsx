import BotMessage from './BotMessage.js';
import QuestionOutlined from '@ant-design/icons';
import Popover from 'antd/es/popover';

export type HelpButtonParams = {
	titleKey: string;
	contentKey: string;
};
export default function Help({ titleKey, contentKey }: HelpButtonParams) {
	const title = <BotMessage key={titleKey} />;
	const content = <BotMessage key={contentKey} />;
	return (
		<Popover content={content} title={title} trigger="click">
			<QuestionOutlined />
		</Popover>
	);
}

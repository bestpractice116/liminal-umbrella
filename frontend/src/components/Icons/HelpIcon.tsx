import { useContext } from 'react';
import { DebugContext } from '../Debug';
import { useBotMessage } from '../BotMessage';
import QuestionOutlined from '@ant-design/icons';
import Popover from 'antd/es/popover';

export type HelpButtonParams = {
	titleKey: string;
	contentKey: string;
};
export function HelpIcon({ titleKey, contentKey }: HelpButtonParams) {
	const { debug } = useContext(DebugContext);
	const { botMessage } = useBotMessage();
	const content = botMessage(contentKey);
	if (!debug && !content) {
		return null;
	}
	const title = botMessage(titleKey) || undefined;
	return (
		<Popover content={content} title={title} trigger="click">
			<QuestionOutlined />
		</Popover>
	);
}

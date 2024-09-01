import BotMessage from './BotMessage.js';
import AntdTooltip from 'antd/es/tooltip';
import type { PresetColorType } from 'antd/es/_util/colors.js';

export type HelpButtonParams = {
	key: string;
	color: PresetColorType | undefined;
};
export default function Tooltip({ key, color, children }: HelpButtonParams & { children: React.ReactNode }) {
	const title = <BotMessage key={key} />;
	return (
		<AntdTooltip title={title} color={color}>
			{children}
		</AntdTooltip>
	);
}

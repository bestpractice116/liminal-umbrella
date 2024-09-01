import { useContext } from 'react';
import { botMessage } from './BotMessage.js';
import AntdTooltip from 'antd/es/tooltip';
import type { PresetColorType } from 'antd/es/_util/colors.js';
import { DebugContext } from './Debug';

export type TooltipParams = {
	messageKey: string;
	color?: PresetColorType | undefined;
};
export default function Tooltip({ messageKey, color, children }: TooltipParams & { children: React.ReactNode }) {
	const { debug } = useContext(DebugContext);
	const title = botMessage(messageKey, debug ? undefined : null);
	return title ? (
		<AntdTooltip title={title} color={color}>
			{children}
		</AntdTooltip>
	) : (
		children
	);
}

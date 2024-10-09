import { useContext } from 'react';
import { useBotMessage } from '../../components/BotMessage';
import AntdTooltip from 'antd/es/tooltip';
import type { PresetColorType } from 'antd/es/_util/colors.js';
import { EditModeContext } from '../EditMode';
import { EditOutlined } from '@ant-design/icons';

export interface TooltipParams {
	messageKey: string;
	color?: PresetColorType | undefined;
}
export function Tooltip({ messageKey, color, children }: TooltipParams & { children: React.ReactNode }) {
	const { botMessage } = useBotMessage();
	const { editMode } = useContext(EditModeContext);
	const message = botMessage(messageKey);
	const title = editMode ? (
		<>
			{message} <EditOutlined />
		</>
	) : (
		message
	);
	return title ? (
		<AntdTooltip title={message} color={color}>
			{children}
		</AntdTooltip>
	) : (
		children
	);
}

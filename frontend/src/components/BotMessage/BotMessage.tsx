import { EditModeContext } from '../EditMode';
import { EditOutlined } from '@ant-design/icons';
import { useBotMessage } from './hooks';
import { type BotMessageProps } from './types';
import { useContext } from 'react';

export function BotMessage(props: BotMessageProps) {
    const { botMessage } = useBotMessage();
    return botMessage(props.messageKey);
}

export default function BotMessageEditable(props: BotMessageProps) {
    const { botMessage } = useBotMessage();
    const { editMode } = useContext(EditModeContext);
    const message = botMessage(props.messageKey);
    return editMode ? (
        <span>
            {message} <EditOutlined />
        </span>
    ) : (
        <span>{message}</span>
    );
}

import { useContext, createContext } from 'react';
import { MessagesData } from './types';
import { DebugContext } from '../Debug';
import { EditModeContext } from '../EditMode';

export const MessageContext = createContext({} as MessagesData);

export function useBotMessage() {
    const messages = useContext(MessageContext);
    const { debug } = useContext(DebugContext);
    const { editMode } = useContext(EditModeContext);
    return {
        botMessage: function (messageKey: string) {
            return (messageKey in messages ? messages[messageKey] : debug || editMode ? messageKey : '') || (debug || editMode ? messageKey : '');
        }
    };
}

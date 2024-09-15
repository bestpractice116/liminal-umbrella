import { useContext, createContext } from 'react';
import { MessagesData } from './types';

export const MessageContext = createContext({} as MessagesData);

export function useBotMessage() {
	const messages = useContext(MessageContext);
	return {botMessage: function(messageKey: string, defaultMessage?: string | null | undefined) {
	const defaultM = typeof defaultMessage === 'undefined' ? messageKey : defaultMessage;
		return messageKey in messages ? messages['key'] : defaultM;
	}}
}
import { FormInstance } from 'antd/es/form';
import { createContext } from 'react';

 
export function getEditableContext(): React.Context<FormInstance | null> {
	 
	return createContext<FormInstance | null>(null);
}

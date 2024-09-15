import { FormInstance } from 'antd/es/form';
import { createContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getEditableContext(): React.Context<FormInstance<any> | null> {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return createContext<FormInstance<any> | null>(null);
}

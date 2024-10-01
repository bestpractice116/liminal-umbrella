import { createContext, useState } from 'react';

export const EditModeContext = createContext({ editMode: false, setEditMode: (_: boolean) => {} });
export function EditModeProvider({ children }: { children: React.ReactNode }) {
	const [editMode, setEditMode] = useState(false);
	return <EditModeContext.Provider value={{ editMode, setEditMode }}>{children}</EditModeContext.Provider>;
}

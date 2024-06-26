import { createContext, type FC } from 'react';
import type  { GetRef } from 'antd/es/_util/type';
import Input from 'antd/es/input';
import Form from 'antd/es/form';
import Table from 'antd/es/table';

export type InputRef = GetRef<typeof Input>
export type FormInstance<T> = GetRef<typeof Form<T>>;

export interface EditableCellProps<T> {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof T;
    record: T;
    handleSave: (record: T, form: FormInstance<any>, _: Function) => void;
}

export type EditableTableProps = Parameters<typeof Table>[0];

function getEditableContext(): React.Context<FormInstance<any> | null> {
  return createContext<FormInstance<any> | null>(null);
}

interface EditableRowProps {
    index: number;
}

export function getEditables() {
    const EditableContext = getEditableContext()
    const EditableRow: FC<EditableRowProps> = ({index, ...props}) => {
        const [form] = Form.useForm();
        return (
          <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
              <tr {...props} />
            </EditableContext.Provider>
          </Form>
        );
    };
    return {
        EditableContext,
        EditableRow,
    }
}
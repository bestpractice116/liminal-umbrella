import { createContext, type FC, useState, useContext, useRef, useEffect } from 'react';
import type  { GetRef } from 'antd/es/_util/type';
import Input from 'antd/es/input';
import Form from 'antd/es/form';
import Table from 'antd/es/table';
import { RuleRender } from 'rc-field-form/es/interface.js'

type InputRef = GetRef<typeof Input>
export type FormInstance<T> = GetRef<typeof Form<T>>;

interface EditableCellProps<T> {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof T;
    record: T;
    handleSave: (record: T, form: FormInstance<any>, _: Function) => void;
}

type EditableTableProps = Parameters<typeof Table>[0];
export type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

interface Item {
    key: string;
    name: string;
}

function getEditableContext(): React.Context<FormInstance<any> | null> {
  return createContext<FormInstance<any> | null>(null);
}

interface EditableRowProps {
    index: number;
}

export function getEditables(formRule: RuleRender) {
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
    const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps<Item>>> = ({
        title,
        editable,
        children,
        dataIndex,
        record,
        handleSave,
        ...restProps
      }) => {
        const [editing, setEditing] = useState(false);
        const inputRef = useRef<InputRef>(null);
        const form = useContext(EditableContext)!;

        useEffect(() => {
          if (editing) {
            inputRef.current?.focus();
          }
        }, [editing]);

        const toggleEdit = () => {
          setEditing(!editing);
          form.setFieldsValue({ [dataIndex]: record[dataIndex] });
        };

        const save = async () => {
          try {
            const values = await form.validateFields();

            console.log("Calling handleSave")
            handleSave({ ...record, ...values }, form, toggleEdit)
          } catch (errInfo) {
            console.log('Save failed:', errInfo);
          }
        };

        let childNode = children;

        if (editable) {
          childNode = editing ? (
            <Form.Item
              style={{ margin: 0 }}
              name={dataIndex}
              rules={[formRule]}
            >
              <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
          ) : (
            <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
              {children}
            </div>
          );
        }

        return <td {...restProps}>{childNode}</td>;
    };
    return {
        EditableRow,
        EditableCell
    }
}
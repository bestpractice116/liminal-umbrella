import Table, { ColumnsType } from 'antd/es/table';
import { Spin } from '../../components/Spin';
import { useTableComponents, useFormHandlers, useFetchQuery, getColumns, DefaultColumns, WrapCRUD } from '../../lib/CRUD';
import { RoleSchema, type RoleListItem } from 'common/schema';

export function AdminRoles() {
    const result = useFetchQuery<RoleListItem[]>('/api/role', 'role');
    const { isUpdating, handleUpdate } = useFormHandlers<RoleListItem>('/api/role', 'role');
    const components = useTableComponents(RoleSchema);

    const defaultColumns: DefaultColumns<RoleListItem> = [
        {
            title: 'Name',
            dataIndex: 'name',
            editable: false
        },
        {
            title: 'Mentionable',
            dataIndex: 'mentionable',
            editable: false,
            render: (mentionable: boolean) => (mentionable ? 'Yes' : 'No')
        }
    ];

    const columns = getColumns<RoleListItem>(defaultColumns, handleUpdate);
    return (
        <WrapCRUD<RoleListItem> result={result}>
            <>
                <Spin spinning={isUpdating} />
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={result.data}
                    columns={columns as ColumnsType<RoleListItem>}
                />
            </>
        </WrapCRUD>
    );
}

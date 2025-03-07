import Table, { ColumnsType } from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import { Spin } from '../../components/Spin';
import Popconfirm from 'antd/es/popconfirm';
import Divider from 'antd/es/divider';
import { DeleteOutlined } from '@ant-design/icons';
import { ActivitySchema, type BotActivityListItem, type BotActivityCreate } from 'common/schema';
import { getZObject } from 'common';
import { createSchemaFieldRule } from 'antd-zod';
import {
    useTableComponents,
    useFetchQuery,
    useFormHandlers,
    useCreateMutationAndUpdateQueryData,
    AddRow,
    getColumns,
    DefaultColumns,
    WrapCRUD
} from '../../lib/CRUD';

const createFormRule = createSchemaFieldRule(getZObject(ActivitySchema.create!));

export function AdminBotplaying() {
    const components = useTableComponents(ActivitySchema);
    const result = useFetchQuery<BotActivityListItem[]>('/api/botplaying', 'bot_playing');
    const { isUpdating, isDeleting, handleUpdate, handleDelete } = useFormHandlers('/api/botplaying', 'bot_playing');
    const { isCreating, createMutation } = useCreateMutationAndUpdateQueryData<BotActivityCreate, BotActivityListItem>('/api/botplaying', 'bot_playing');

    const defaultColumns: DefaultColumns<BotActivityListItem> = [
        {
            title: 'Name',
            dataIndex: 'name',
            editable: true,
            ellipsis: true
        },
        {
            title: 'operation',
            dataIndex: 'operation',
            ellipsis: true,
            render: (_, record) =>
                result.data!.length >= 1 ? (
                    <Popconfirm title="Sure to delete?" onConfirm={() => { handleDelete(record.key); }}>
                        <DeleteOutlined />
                        &nbsp;<a>Delete</a>
                    </Popconfirm>
                ) : null
        }
    ];

    const columns = getColumns<BotActivityListItem>(defaultColumns, handleUpdate);

    return (
        <WrapCRUD<BotActivityListItem> result={result}>
            <>
                <Spin spinning={isCreating || isUpdating || isDeleting} />
                <div>
                    This page is for editing the games which the bot can be listed as '<code>Playing ...</code>' in the user list at the side of
                    Discord. The bot will randomly pick a new activity from this list roughly every 4 hours (although this will vary!).
                    <br />
                    The list here is not used anywhere else in the bot, and so it's safe to add or remove items as you see fit and you can add items
                    which are not TTRPGs (e.g. <code>with kittens</code>)
                </div>
                <Divider />
                <AddRow<BotActivityCreate> createMutation={createMutation}>
                    <Form.Item label="Name" name="name" rules={[createFormRule]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="type" initialValue="playing">
                        <Input type="hidden" />
                    </Form.Item>
                </AddRow>
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={result.data}
                    columns={columns as ColumnsType<BotActivityListItem>}
                />
            </>
        </WrapCRUD>
    );
}

import ReactTimeAgo from 'react-time-ago'

import Table from 'antd/es/table';
import { Spin } from '../../components/Spin';
import Tag from 'antd/es/tag';
import { useFetchQuery, useTableComponents, ColumnTypes, getColumns, DefaultColumns, WrapCRUD, useFormHandlers } from '../../lib/CRUD';
import { UserSchema, type UserListItem } from 'common/schema';
import { LinkOutlined} from '@ant-design/icons';
import { FilterDropdownProps } from 'antd/es/table/interface';
import Button from 'antd/es/button';
import Space from 'antd/es/space';
import Slider, { SliderSingleProps } from 'antd/es/slider';
import { useState } from 'react';

interface UserFragment {
    roles: RoleFragment[];
}
interface RoleFragment {
    name: string;
    hexColor: string;
    position: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const RenderNickname = ({nickname, record}: {nickname: string, record: any}) => {
    const uf = record as UserFragment;
    const roles = uf.roles
        .filter((role: RoleFragment) => role.hexColor != '#000000')
        .toSorted((a, b) => {
            if (a.position < b.position) return 1;
            if (a.position > b.position) return -1;
            return 0;
        });
    let color: string | undefined = undefined;
    if (roles.length > 0) color = roles[0].hexColor;
    return (
        <span style={{ color }}>
            <b>{nickname}</b>
        </span>
    );
}

const RenderLastSeen = ({lastSeenTime, record}: {lastSeenTime: string, record: any}) => {
    const lst = new Date(lastSeenTime);
    if (lst <= new Date('1970-01-02:00:00:00.000Z')) {
        return 'Never';
    }
    const seen = <><ReactTimeAgo date={lst} /> ({lst.toLocaleDateString()})</>;

    return <>
            {seen}
            {record.lastSeenChannelName ? <>&nbsp;in #{record.lastSeenChannelName}</> : null}
            {record.lastSeenChannel ? <>&nbsp;<a href={record.lastSeenLink} target="_blank"><LinkOutlined /></a></> : null}
        </>
}

const RenderRoles = ({roles, record}: {roles: { name: string; hexColor: string }[], record: any}) =>
    roles
        .filter((role) => role.name !== '@everyone' && role.name !== 'AllUsers')
        .toSorted((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        })
        .map((role, index) => (
            <span key={`${record.key}${index}`}>
                <Tag color={role.hexColor == '#000000' ? undefined : role.hexColor}>{role.name}</Tag>
                <br />
            </span>
        ))

const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (value) => `${value} months`;

export function AdminUsers() {
    const components = useTableComponents(UserSchema);
    const result = useFetchQuery<UserListItem[]>('/api/user', 'user');
    const { isUpdating, handleUpdate } = useFormHandlers('/api/user', 'user');
    const defaultLastSeen = 12;
    const [lastSeenFilter, setLastSeenFilter] = useState(defaultLastSeen);
    const [doLastSeenFilter, setDoLastSeenFilter] = useState(false);

    console.log(`lastSeenFilter: ${lastSeenFilter}`);

    const FilterLastSeen = ({setSelectedKeys, selectedKeys, confirm, clearFilters, close}: FilterDropdownProps) => {
        return (
            <div style={{ padding: 8 }} onKeyDown={(e) => { e.stopPropagation(); }}>
                <Slider min={3} max={24} step={1} defaultValue={lastSeenFilter} tooltip={{ formatter }} onChange={(val) => { setLastSeenFilter(val); }}/>
                <Space>
                <Button
                    type="primary"
                    onClick={() => {
                        setSelectedKeys(['lastseen', ...selectedKeys]);
                        setDoLastSeenFilter(true);
                        confirm({closeDropdown: true})
                    }}
                    size="small"
                    style={{ width: 90 }}
                >
                    Filter
                </Button>
                <Button
                    onClick={() => {
                        setLastSeenFilter(defaultLastSeen); 
                        setDoLastSeenFilter(false);
                        setSelectedKeys(selectedKeys.filter(key => key !== 'lastseen'));
                        if (clearFilters) { clearFilters() };
                        close();
                    }}
                    size="small"
                    style={{ width: 90 }}

                >
                    Reset
                </Button>
                <Button
                    type="link"
                    size="small"
                    onClick={() => {
                        close();
                    }}
                >
                    close
                </Button>
                </Space>
            </div>
        )
    };

    const defaultColumns: DefaultColumns = [
        {
            title: 'Avatar',
            dataIndex: 'avatarURL',
            editable: false,
            ellipsis: true,
            render: (avatarURL: string) => <img src={avatarURL} style={{ margin: 0, padding: 0, width: 50 }} alt="avatar" />
        },
        {
            title: 'Nickname',
            dataIndex: 'nickname',
            editable: false,
            ellipsis: true,
            defaultSortOrder: 'ascend',
            sorter: (a, b) => a.nickname.toUpperCase() < b.nickname.toUpperCase() ? -1 : a.nickname.toUpperCase() > b.nickname.toUpperCase() ? 1 : 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (nickname: string, record: any) => <RenderNickname nickname={nickname} record={record as UserListItem} />
        },
        {
            title: 'Name',
            dataIndex: 'name',
            editable: false,
            ellipsis: true,
            sorter: (a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : a.name.toUpperCase() > b.name.toUpperCase() ? 1 : 0,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            editable: false,
            ellipsis: true,
            sorter: (a, b) => a.username.toUpperCase() < b.username.toUpperCase() ? -1 : a.username.toUpperCase() > b.username.toUpperCase() ? 1 : 0,

        },
        {
            title: 'Last seen',
            dataIndex: 'lastSeenTime',
            editable: false,
            render: (lastSeenTime, record) => <RenderLastSeen lastSeenTime={lastSeenTime} record={record} />,
            sorter: (a, b) => a.lastSeenTime < b.lastSeenTime ? -1 : a.lastSeenTime > b.lastSeenTime ? 1 : 0,
            filterDropdown: (props: FilterDropdownProps) => <FilterLastSeen {...props} />,
            onFilter: (value, record) => {
                const recordTime = (new Date(record.lastSeenTime)).getTime();
                const valTime = Date.now() - Math.abs(value as number * 365/12 * 24 * 60 * 60 * 1000);
                console.log(`Record last seen ${recordTime} val ${valTime} answer ${recordTime < valTime}`);
                return recordTime < valTime;
            },
            filteredValue: doLastSeenFilter ? [lastSeenFilter] : [],
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            editable: false,
            ellipsis: true,
            render: (roles, record) => <RenderRoles roles={roles} record={record} />,
            onFilter: (value, record) => {
                const roleNames = record.roles.map((role: { name: any; }) => role.name);
                return value === 'Not Known Member' ? !roleNames.includes('Known Member') : roleNames.includes('Known Member')
            },
            filterMultiple: true,
            filters: ['Not Known Member', 'Known Member'].map((val: string) => {return {text: val, value: val}}),
        }
    ];

    const columns = getColumns<UserListItem>(defaultColumns, handleUpdate);

    return (
        <WrapCRUD<UserListItem> result={result}>
            <>
                <Spin spinning={isUpdating} />
                <Table
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={result.data}
                    columns={columns as ColumnTypes}
                />
            </>
        </WrapCRUD>
    );
}

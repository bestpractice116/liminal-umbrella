import ReactTimeAgo from 'react-time-ago'
import { Button, type TableProps } from 'antd';
import Table from 'antd/es/table';
import { Spin } from '../../components/Spin';
import Tag from 'antd/es/tag';
import { useFetchQuery, useTableComponents, getColumns, DefaultColumns, WrapCRUD, useFormHandlers } from '../../lib/CRUD';
import { UserSchema, type UserListItem } from 'common/schema';
import { LinkOutlined} from '@ant-design/icons';
import { ColumnsType, FilterDropdownProps } from 'antd/es/table/interface';
import Space from 'antd/es/space';
import Slider, { SliderSingleProps } from 'antd/es/slider';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FetchMethods, FetchResultTypes, fetch } from '@sapphire/fetch';

type OnChange = NonNullable<TableProps<UserListItem>['onChange']>;
type Filters = Parameters<OnChange>[1];

type GetSingle<T> = T extends (infer U)[] ? U : never;
type Sorts = GetSingle<Parameters<OnChange>[2]>;

interface UserFragment {
    roles: RoleFragment[];
}
interface RoleFragment {
    name: string;
    hexColor: string;
    position: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention
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

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
const RenderLastSeen = ({lastSeenTime, record}: {lastSeenTime: string, record: any}) => {
    const lst = new Date(lastSeenTime);
    if (lst <= new Date('1970-01-02:00:00:00.000Z')) {
        return 'Never';
    }
    const seen = <><ReactTimeAgo date={lst} /> ({lst.toLocaleDateString()})</>;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const lastSeenChannelName: string = record.lastSeenChannelName;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const lastSeenLink: string = record.lastSeenLink;

    return <>
            {seen}
            {lastSeenChannelName ? <>&nbsp;in #{lastSeenChannelName}</> : null}
            {lastSeenLink ? <>&nbsp;<a href={lastSeenLink} target="_blank"><LinkOutlined /></a></> : null}
        </>
}

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-explicit-any
const RenderRoles = ({roles, record}: {roles: { name: string; hexColor: string }[], record: any}) =>
    roles
        .filter((role) => role.name !== '@everyone' && role.name !== 'AllUsers')
        .toSorted((a, b) => {
            if (a.name > b.name) return 1;
            if (a.name < b.name) return -1;
            return 0;
        })
        .map((role, index) => (
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            <span key={`${record.key}${index}`}>
                <Tag color={role.hexColor == '#000000' ? undefined : role.hexColor}>{role.name}</Tag>
                <br />
            </span>
        ))

const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (value) => `${value} months`;
const ages: SliderSingleProps['marks'] = {
    3: '3',
    6: '6',
    9: '9',
    12: '12',
    18: '18',
    24: '24',
}

interface filterLastSeenProps {
    setLastSeenFilter: (val: number | null) => void,
    defaultLastSeen: number
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const FilterLastSeen = ({ confirm, close, setLastSeenFilter, defaultLastSeen }: 
    FilterDropdownProps & filterLastSeenProps
) => {
    const [sliderVal, setSliderVal] = useState(defaultLastSeen);
    return (
        <div style={{ padding: 8 }} onKeyDown={(e) => { e.stopPropagation(); }}>
            <Slider min={3} max={24} step={1} defaultValue={defaultLastSeen} tooltip={{ formatter }} marks={ages} onChange={setSliderVal}/>
            <Space>
                <Button
                    onClick={() => {
                        setLastSeenFilter(null); 
                        close();
                    }}
                    size="small"
                    style={{ width: 60 }}

                >
                    Reset
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        setLastSeenFilter(sliderVal);
                        confirm({closeDropdown: true})
                    }}
                    size="small"
                    style={{ width: 90 }}
                >
                    OK
                </Button>
            </Space>
        </div>
    )
};

export function AdminUsers() {
    const queryClient = useQueryClient();
    const components = useTableComponents(UserSchema);
    const result = useFetchQuery<UserListItem[]>('/api/user', 'user');
    const { isUpdating, handleUpdate } = useFormHandlers('/api/user', 'user');
    const defaultLastSeen = 12;
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [filteredInfo, setFilteredInfo] = useState<Filters>({});
    const [sortedInfo, setSortedInfo] = useState<Sorts>({});

    console.log('Filtered Info is ', filteredInfo)

    const kickUsersMutation = useMutation({
        mutationFn: (r: string[]) => {
            return fetch(
                '/api/user',
                {
                    method: FetchMethods.Delete,
                    body: JSON.stringify({userIds: r}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                },
                FetchResultTypes.JSON
            ).then((data) => {
                return queryClient.invalidateQueries({ queryKey: ['user']}).then(() => {
                    setSelectedKeys([]);
                    return data;
                })
            });
        }
    });

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const rowSelection: TableProps<UserListItem>['rowSelection'] = {
        onChange: (selectedRowKeys: React.Key[], selectedRows: UserListItem[]) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`);
          console.log(`selectedRows: `, selectedRows);
          setSelectedKeys(selectedRowKeys.map(k => `${k}`));
        },
        getCheckboxProps: (record: UserListItem) => {
            console.log(record);
            const roleNames = record.roles.map(role => role.name);
            return {
                disabled: roleNames.includes('Admin') || roleNames.includes('Patron'), 
                name: record.key,
            }
        },
        type: 'checkbox',
      };

    const tableFooter = () => {
        const kickDisabled= selectedKeys.length === 0
        return <>
        <Button type="primary" danger disabled={kickDisabled} onClick={() => { kickUsersMutation.mutate(selectedKeys); }}>
            Kick users
        </Button>
    </>}

    const defaultColumns: DefaultColumns<UserListItem> = [
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
            sortOrder: sortedInfo.columnKey === 'nickname' ? sortedInfo.order : null,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            sorter: (a, b) => a.nickname.toUpperCase() < b.nickname.toUpperCase() ? -1 : a.nickname.toUpperCase() > b.nickname.toUpperCase() ? 1 : 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            render: (nickname: string, record: any) => <RenderNickname nickname={nickname} record={record as UserListItem} />
        },
        {
            title: 'Name',
            dataIndex: 'name',
            editable: false,
            ellipsis: true,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            sorter: (a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? -1 : a.name.toUpperCase() > b.name.toUpperCase() ? 1 : 0,
            sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            editable: false,
            ellipsis: true,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            sorter: (a, b) => a.username.toUpperCase() < b.username.toUpperCase() ? -1 : a.username.toUpperCase() > b.username.toUpperCase() ? 1 : 0,
            sortOrder: sortedInfo.columnKey === 'username' ? sortedInfo.order : null,
        },
        {
            title: 'Last seen',
            dataIndex: 'lastSeenTime',
            editable: false,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            render: (lastSeenTime, record) => <RenderLastSeen lastSeenTime={lastSeenTime} record={record} />,
            sorter: (a, b) => a.lastSeenTime < b.lastSeenTime ? -1 : a.lastSeenTime > b.lastSeenTime ? 1 : 0,
            sortOrder: sortedInfo.columnKey === 'lastSeenTime' ? sortedInfo.order : null,
            filterDropdown: (props: FilterDropdownProps) => <FilterLastSeen {...props} 
                setLastSeenFilter={(val: number | null) => {
                    if (val) {
                        setFilteredInfo({...filteredInfo, 'lastSeenTime': [`${val}`]})
                    } else {
                        setFilteredInfo({...filteredInfo, 'lastSeenTime': null});
                    }
                }}
                defaultLastSeen={defaultLastSeen}
            />,
            onFilter: (value, record) => {
                console.log('onFilter for lastSeenTime ', value, record);
                if (!value || isNaN(value as number)) return true;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                const recordTime = (new Date(record.lastSeenTime)).getTime();
                const valTime = Date.now() - Math.abs(value as number * 365/12 * 24 * 60 * 60 * 1000);
                console.log(`Record last seen ${recordTime} val ${valTime} answer ${recordTime < valTime}`);
                return recordTime < valTime;
            },
            filteredValue: filteredInfo.lastSeenTime ?? null,

        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            editable: false,
            ellipsis: true,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            render: (roles, record) => <RenderRoles roles={roles} record={record} />,
            onFilter: (value, record) => {
                if (!value) return true;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return
                const roleNames = record.roles.map((role: { name: any; }) => role.name);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                return value === 'Not Known Member' ? !roleNames.includes('Known Member') : roleNames.includes('Known Member')
            },
            filteredValue: filteredInfo.roles ?? null,
            filters: ['Not Known Member', 'Known Member'].map((val: string) => {return {text: val, value: val}}),
        }
    ];

    const columns = getColumns<UserListItem>(defaultColumns, handleUpdate);

    const handleChange: OnChange = (pagination, filters, sorter) => {
        console.log('Various parameters', pagination, filters, sorter);
        setFilteredInfo(filters);
        setSortedInfo(sorter as Sorts);
      };

    return (
        <WrapCRUD<UserListItem> result={result}>
            <>
                <Spin spinning={isUpdating} />
                <Table
                    pagination={{ pageSize: 50, pageSizeOptions: [200, 100, 50], defaultPageSize: 100 }}
                    rowSelection={rowSelection}
                    components={components}
                    rowClassName={() => 'editable-row'}
                    bordered
                    dataSource={result.data}
                    columns={columns as ColumnsType<UserListItem>}
                    footer={tableFooter}
                    onChange={handleChange}
                />
            </>
        </WrapCRUD>
    );
}

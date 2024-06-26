import {useState} from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query'
import Button from 'antd/es/button';
import Table from 'antd/es/table';
import Form from 'antd/es/form';
import Input from 'antd/es/input';
import Spin from 'antd/es/spin';
import Popconfirm from 'antd/es/popconfirm';
import * as z from 'zod';
import { fetch, FetchResultTypes, FetchMethods } from '@sapphire/fetch'
import { ActivitySchema, ActivityType } from 'common/schema';
import { ErrorFallback, useErrorBoundary } from '../ErrorFallback';
import { FormInstance, getEditables, ColumnTypes, DataType, getQueries } from '../CRUD.js';

interface FetchBotActivityListResponse extends Array<{ key: number, name: string, type: ActivityType }>{};

type CreateFieldType = {
  name?: string;
};

const { EditableRow, EditableCell } = getEditables(ActivitySchema.formRule);

export default function AdminBotPlaying() {
  const [isMutating, setIsMutating] = useState(false);
  const { showBoundary } = useErrorBoundary();
  const queryClient = useQueryClient();
  const { result } = getQueries<FetchBotActivityListResponse>('/api/botplaying', 'bot_playing')
  const deleteMutation = useMutation({
    mutationFn: async (r: any) => {
      return fetch(`/api/botplaying/${r.key}`, {
        method: FetchMethods.Delete
      }, FetchResultTypes.JSON).then(_data => {
        queryClient.setQueryData(['bot_playing'], (old: any) => {
          return old.filter((item: any) => item.key !== r.key)
        })
      }).catch((e) => showBoundary(e))
    },
    onMutate: () => {
      setIsMutating(true);
    },
    onSettled: () => {
      setIsMutating(false);
    },
  })
  const updateMutation = useMutation({
    mutationFn: async (r: any) => {
      return fetch(`/api/botplaying/${r.key}`, {
        method: FetchMethods.Post,
        body: JSON.stringify(r),
        headers: {
          'Content-Type': 'application/json'
        },
        },FetchResultTypes.JSON
      ).then((data: any) => {
        if (data.status !== "ok") {
          console.error("Error updating data", data)
          throw(new z.ZodError(data.error))
        }
        queryClient.setQueryData(['bot_playing'], (old: any) => {
          return old.map((item: any) => {
            console.log("ITEM", item, r.key, item.key === r.key)
            if (item.key === r.key) {
              return data.datum;
            }
            return item;
          })
        })
      }).catch((e) => showBoundary(e))
    },
    onMutate: () => {
      setIsMutating(true);
    },
    onSettled: () => {
      setIsMutating(false);
    },
  })
  const createMutation = useMutation({
    mutationFn: async (r: any) => {
      return fetch(`/api/botplaying`, {
        method: FetchMethods.Post,
        body: JSON.stringify(r),
        headers: {
          'Content-Type': 'application/json'
        }
      }, FetchResultTypes.JSON).then((data:any) => {
        queryClient.setQueryData(['bot_playing'], (old: any) => {
          return [...old, data.datum]
        })
      }).catch((e) => showBoundary(e))
    },
    onMutate: () => {
      setIsMutating(true);
    },
    onSettled: () => {
      setIsMutating(false);
    },
  })

  if (result.isLoading) {
    return <Spin size="large" />
  }
  if (result.isError) {
    return <ErrorFallback error={result.error} />;
  }

  const handleDelete = (key: React.Key) => {
    deleteMutation.mutate({ key });
  };

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        editable: true,
      },
      {
        title: 'operation',
        dataIndex: 'operation',
        render: (_, record) =>
          dataSource.length >= 1 ? (
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      },
    ];

  const handleSave = (row: DataType, _form: FormInstance<any>, toggleEdit: Function): Boolean => {
      console.log('calling update mutation, have form', _form)
      updateMutation.mutate({...row, type: 'playing'}, {
        onError: (e) => {
          try {
          console.log("HERE", e);
          const formatted = (e as z.ZodError).format();
          const f = Object.entries(formatted)
          .filter(([key, _]) => key !== '_errors')
          .map(([key, value]) => {return {name: key, errors: (value as any)._errors}});
          console.log('setting fields', f)
          _form.setFields(f)
          } catch (e) {showBoundary(e)}
        },
        onSuccess: () => {
          toggleEdit();
        }
      });
      console.log('finished update mutation')
      return true
  };

  const columns = defaultColumns!.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const dataSource: DataType[] = result.data!;

  const AddRow = () => {
    const [amCreating, setCreating] = useState(false)
    if (!amCreating) {
      return <Button onClick={() => setCreating(true)} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button>
    }
    return <Form onFinish={(values) => {
      createMutation.mutate({name: values.name, type: 'playing'})
      setCreating(false)
    }}>
      <Form.Item<CreateFieldType>
        label="Name"
        name="name"
        rules={[ActivitySchema.formRule]}
      >
        <Input />
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  }

  return <div>
    <Spin spinning={isMutating} fullscreen />
    <AddRow />
    <Table
      components={components}
      rowClassName={() => 'editable-row'}
      bordered
      dataSource={dataSource}
      columns={columns as ColumnTypes}
    />
  </div>
}

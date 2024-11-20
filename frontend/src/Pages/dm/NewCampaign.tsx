import { useState, createRef } from 'react';
import Button from 'antd/es/button';
import { CampaignCreateItem, CampaignReadItem, CampaignSchema, CampaignUpdateItem, GameSchema, GameType } from 'common/schema';
import { MutationReturn, useCreateMutation, useFetchQuery, useUpdateMutation } from '../../lib/CRUD';
import { Spin } from '../../components/Spin';
import Form, { FormInstance } from 'antd/es/form';
import { getZObject } from 'common';
import { UseMutationResult, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { CheckCircleOutlined } from '@ant-design/icons';
import BotMessage from '../../components/BotMessage';
import { GameForm } from './types.js';
import { SafeParseReturnType } from 'zod';
import PostCampaignForm from './PostCampaignForm.js';

export function NewCampaign() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @eslint-react/no-create-ref
    const formRef = createRef<FormInstance<CampaignUpdateItem>>();
    return <NewCampaignInner formRef={formRef} />;
}

function NewCampaignInner({ formRef }: { formRef: React.RefObject<FormInstance<CampaignUpdateItem>> }) {
    // FIXME - this name is bad as it isn't just creating
    const [postId, _setPostId] = useState(-1);
    const result = useFetchQuery<CampaignReadItem[]>('/api/campaign', 'campaign');
    const queryClient = useQueryClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { createMutation, isCreating } = useCreateMutation<CampaignCreateItem, CampaignReadItem>('/api/campaign', 'campaign', (data: MutationReturn<CampaignReadItem>) => {
        formRef.current!.setFieldValue('key', data.datum.key);
        // FIXME - why can't we use the built in one?
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(['campaign'], () => {
            return [data.datum];
        });
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { updateMutation, isUpdating } = useUpdateMutation('/api/campaign', (data: MutationReturn<CampaignReadItem>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        queryClient.setQueryData(['campaign'], (_old: any) => {
            return [data.datum];
        });
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let initialValues: Partial<CampaignCreateItem> = {
        maxplayers: 4,
        type: 'campaign' as GameType
    };
    let hasGame = false;
    if (result.isFetched && result.data && result.data.length >= 1) {
        // THe length should never be > 1, but lets try to work anyway.
        const res = getZObject(CampaignSchema.read.unwrap()).safeParse(result.data[0]) as SafeParseReturnType<unknown, CampaignReadItem>;
        if (!res.success) {
            console.error('error parsing NewGameSchea.read', res.error.format());
        } else {
            initialValues = res.data;
            hasGame = true;
        }
    }
    if (!result.isFetched) {
        return <Spin spinning={true} />;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mutation: UseMutationResult<MutationReturn<CampaignReadItem>, Error, any, any> = createMutation;
    if (hasGame) {
        mutation = updateMutation;
    }
    const save = () => {
        if (!formRef.current) {
            return;
        }
        const data = formRef.current.getFieldsValue();
        mutation.mutate(data);
    };
    const postcampaign = () => {
        const data = formRef.current!.getFieldsValue();
        mutation.mutate(data, {
            onSuccess: () => {
                
            },
            onError: (e) => {
                throw e;
            }
        });
    };

    if (postId > 0) {
        return <Navigate to={`/dm/viewgame/${postId}`} />;
    }
    return (
        <PostCampaignForm
            isLoading={isCreating || isUpdating || result.isFetching}
            save={save}
            formRef={formRef}
            mutation={mutation}
            initialValues={initialValues}
        >
            <PostButton form={formRef} doPost={postcampaign} />
        </PostCampaignForm>
    );
}

 
function PostButton({ form, doPost }: { form: React.RefObject<FormInstance | undefined>; doPost: () => void }) {
    const values = Form.useWatch([], form.current ?? undefined) as GameForm | undefined;
    if (!form.current) return <></>;
    const hasFieldErrors = form.current.getFieldsError().filter((field) => field.errors.length > 0).length > 0;
    const isPostable = !hasFieldErrors && getZObject(GameSchema.create!).safeParse(values).success;
    return (
        <Button type="primary" icon={<CheckCircleOutlined />} disabled={!isPostable} onClick={doPost}>
            <BotMessage messageKey="BUTTON_NEW_GAME_POST_GAME" />
        </Button>
    );
}

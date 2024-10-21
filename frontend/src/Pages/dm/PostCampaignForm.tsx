import { type RefObject } from 'react';
import Form, { FormInstance, type FormItemProps } from 'antd/es/form';
import Input from 'antd/es/input';
import Select from 'antd/es/select';
import { Spin } from '../../components/Spin';
import { type CampaignUpdateItem, CampaignSchema, CampaignCreateItem } from 'common/schema';
import { CreateForm, MutationReturn } from '../../lib/CRUD';
import { createSchemaFieldRule } from 'antd-zod';
import { UseMutationResult } from '@tanstack/react-query';
import { getZObject } from 'common';
import GameSystemSelect from './GameSystemSelect.js';
import GameTypeSelect from './GameTypeSelect.js';
import { Tooltip } from '../../components/Tooltip';
import { useBotMessage } from '../../components/BotMessage';

const updateFormRule = createSchemaFieldRule(getZObject(CampaignSchema.update!).partial());

function FormItem<T>({ name, children, rules, ...rest }: { name: string, children: React.ReactNode } & Omit<FormItemProps<T>, 'name'>) {
    rules ||= []
    const { botMessage } = useBotMessage();
    const tooltip = `TOOLTIP_CAMPAIGN_${name.toUpperCase()}`;
    const message = botMessage(`LABEL_CAMPAIGN_${name.toUpperCase()}`);
    return (
        <Form.Item<T>
            {...rest}
            name={name as FormItemProps<T>['name']}
            label={<Tooltip messageKey={tooltip}>{message}</Tooltip>}
            rules={[updateFormRule, ...rules]}
        >
            {children}
        </Form.Item>
    );
};

export default function PostCampaignForm({
    save,
    isLoading,
    mutation,
    initialValues,
    children,
    createForm = true,
    disabled = false,
    submitButtonText,
    formRef
}: {
    save: () => void;
    isLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutation: UseMutationResult<MutationReturn<CampaignCreateItem>, Error, CampaignCreateItem, CampaignCreateItem>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialValues: Record<string, any>;
    children?: React.ReactNode;
    createForm?: boolean;
    disabled?: boolean;
    submitButtonText?: string;
    formRef: RefObject<FormInstance<CampaignCreateItem>>;
}) {
    children ||= <></>;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any


    return (
        <div>
            {' '}
            <Spin spinning={isLoading} />
                <CreateForm
                    mutation={mutation}
                    initialValues={initialValues}
                    submitButton={!createForm}
                    submitButtonText={submitButtonText}
                    labelCol={{ span: 3 }}
                    wrapperCol={{ span: 21 }}
                    formRef={formRef}
                >
                    <Form.Item<CampaignUpdateItem> style={{ height: 0, margin: 0 }} name="key">
                        <Input type="hidden" />
                    </Form.Item>
                    <FormItem name="name">
                        <Input onPressEnter={save} onBlur={save} disabled={disabled} />
                    </FormItem>
                    <GameTypeSelect save={save} disabled={disabled || !createForm} />
                    <GameSystemSelect save={save} create={createForm} disabled={disabled || !createForm} />
                    <FormItem name="location">
                        <Input onPressEnter={save} onBlur={save} disabled={disabled} />
                    </FormItem>
                    <FormItem name="description">
                        <Input.TextArea rows={6} size={'large'} onBlur={save} disabled={disabled} />
                    </FormItem>
                    <FormItem wrapperCol={{ style: { maxWidth: 100 }, span: 19 }} name="maxplayers">
                        <Select
                            options={Array.from({ length: 7 }, (_, i) => i + 1).map((idx) => {
                                return { value: idx, label: <span>{idx}</span> };
                            })}
                            onBlur={save}
                            disabled={disabled}
                        />
                    </FormItem>
                    {children}
                </CreateForm>
            
        </div>
    );
}

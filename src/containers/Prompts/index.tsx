import { PlusOutlined } from '@ant-design/icons';
import { Button, Table, Input, Modal, Form, Select } from 'antd';
import { Trans, t } from '@lingui/macro';
import { usePrompts } from './hooks';
import { useEffect, useState } from 'react';
import { S } from './styles';

export function PromptsList() {
    const {
        prompts,
        types,
        isModalOpen,
        currentPrompt,
        currentType,
        editingIndex,
        setIsModalOpen,
        setCurrentPrompt,
        setCurrentType,
        openModal,
        handleSave,
        handleRemove,
    } = usePrompts();

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div>
            <S.PageHeader>
                <S.HeaderContainer>
                    <S.Title>
                        <Trans>Prompt</Trans>
                    </S.Title>
                    <Button type="primary" onClick={() => openModal()} icon={<PlusOutlined />}>
                        <Trans>Add New Prompt</Trans>
                    </Button>
                </S.HeaderContainer>
            </S.PageHeader>

            <S.TableContainer>
                {isMobile ? (
                    prompts.map((item, index) => (
                        <S.Card key={index}>
                            <S.CardItem>
                                <span>Type:</span> {item.type}
                            </S.CardItem>
                            <S.CardItem>
                                <span>Prompt:</span> {item.prompt}
                            </S.CardItem>
                            <S.CardItem>
                                <S.ButtonContainer>
                                    <S.Button type="link" onClick={() => openModal(index)}>
                                        <Trans>Edit</Trans>
                                    </S.Button>
                                    <S.Button type="link" onClick={() => handleRemove(index)} danger>
                                        <Trans>Remove</Trans>
                                    </S.Button>
                                </S.ButtonContainer>
                            </S.CardItem>
                        </S.Card>
                    ))
                ) : (
                    <Table
                        dataSource={prompts}
                        columns={[
                            {
                                title: 'Type',
                                dataIndex: 'type',
                                key: 'type',
                            },
                            {
                                title: 'Prompt',
                                dataIndex: 'prompt',
                                key: 'prompt',
                                render: (text) => <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>,
                            },
                            {
                                title: 'Actions',
                                key: 'actions',
                                render: (_text, _record, index) => (
                                    <S.ButtonContainer>
                                        <S.Button type="link" onClick={() => openModal(index)}>
                                            <Trans>Edit</Trans>
                                        </S.Button>
                                        <S.Button type="link" onClick={() => handleRemove(index)} danger>
                                            <Trans>Remove</Trans>
                                        </S.Button>
                                    </S.ButtonContainer>
                                ),
                            },
                        ]}
                        rowKey={(record) => record.id.toString()}
                    />
                )}
            </S.TableContainer>

            <Modal
                title={editingIndex !== null ? t`Edit Prompt` : t`Add New Prompt`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSave}
                okText="Submit"
            >
                <Form>
                    <Form.Item>
                        <Select value={currentType} onChange={setCurrentType} placeholder={t`Select Type`}>
                            {types.map((type: any, index) => (
                                <Select.Option key={index} value={type.code}>
                                    {type.display}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item>
                        <Input.TextArea
                            rows={6}
                            value={currentPrompt}
                            onChange={(e) => setCurrentPrompt(e.target.value)}
                            placeholder={t`Enter your prompt here`}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

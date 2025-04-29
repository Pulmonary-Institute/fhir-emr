import { t } from '@lingui/macro';
import { useState, useEffect } from 'react';
import { notification } from 'antd';

import config from '@beda.software/emr-config';
const baseURL = config.baseURL;
const whisperApiUrl = config.whisperApiUrl;

interface Prompt {
    id: number;
    prompt: string;
    type: string;
}

export const usePrompts = () => {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [currentType, setCurrentType] = useState('pulmonary');
    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    useEffect(() => {
        fetchPrompts();
        fetchTypes();
    }, []);

    const fetchPrompts = async () => {
        try {
            const response = await fetch(`${whisperApiUrl}/prompts`);
            if (!response.ok) throw new Error('Failed to fetch prompts');

            const data = await response.json();
            setPrompts(data.prompts || []);
        } catch (error) {
            notification.error({ message: t`Failed to fetch prompts` });
        }
    };

    const fetchTypes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseURL}/ValueSet/visit-type-codes/$expand?filter=&count=50`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) throw new Error('Failed to fetch types');

            const data = await response.json();
            setTypes(data?.compose?.include?.[0]?.concept || []);
        } catch (error) {
            notification.error({ message: t`Failed to fetch types` });
        }
    };

    const openModal = (index: number | null = null) => {
        setEditingIndex(index);
        if (index !== null) {
            setCurrentPrompt(prompts[index]?.prompt || '');
            setCurrentType(prompts[index]?.type || '');
        } else {
            setCurrentPrompt('');
            setCurrentType(types[0] || 'pulmonary');
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!currentPrompt.trim()) {
            notification.error({ message: t`Prompt cannot be empty` });

            return;
        }

        if (editingIndex === null && prompts.some((prompt) => prompt.type === currentType)) {
            notification.error({ message: t`A prompt with this type already exists` });
            return;
        }

        try {
            let response;
            const payload = JSON.stringify({ prompt: currentPrompt, type: currentType });
            const headers = { 'Content-Type': 'application/json' };

            if (editingIndex !== null) {
                response = await fetch(`${whisperApiUrl}/prompts/${prompts[editingIndex!]?.id}`, {
                    method: 'PUT',
                    headers,
                    body: payload,
                });
            } else {
                response = await fetch(`${whisperApiUrl}/prompts`, {
                    method: 'POST',
                    headers,
                    body: payload,
                });
            }

            const data = await response.json();
            if (response.ok) {
                fetchPrompts();
                notification.success({
                    message: data.message || t`Prompt successfully saved`,
                });
            } else {
                notification.error({ message: t`Failed to save prompt` });
            }
        } catch (error) {
            notification.error({ message: t`An error occurred while saving the prompt` });
        }

        setIsModalOpen(false);
    };

    const handleRemove = async (index: number) => {
        try {
            const prompt = prompts[index];
            if (!prompt) {
                notification.error({ message: t`Prompt not found` });
                return;
            }
            const response = await fetch(`${whisperApiUrl}/prompts/${prompt.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to remove prompt');

            fetchPrompts();
            notification.success({
                message: 'Prompt removed',
            });
        } catch (error) {
            notification.error({ message: t`Failed to remove prompt` });
        }
    };

    return {
        prompts,
        types,
        isModalOpen,
        currentPrompt,
        currentType,
        editingIndex,
        setIsModalOpen,
        setCurrentPrompt,
        setCurrentType,
        setEditingIndex,
        fetchPrompts,
        openModal,
        handleSave,
        handleRemove,
    };
};

const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';
const baseURL = config.baseURL;

export const getUserRolWithoutEvent = async () => {
    try {
        const response = await fetch(`${baseURL}/auth/userinfo`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response?.ok) {
            throw new Error(`Error fetching data: ${response?.statusText}`);
        }
        const data = await response.json();

        return data.role[0]?.name;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

export const getUserRol = async () => {
    try {
        const response = await fetch(`${baseURL}/auth/userinfo`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();

        switch (data.role[0]?.name) {
            case 'scriber':
                return 'process-note-task-status-edit-scriber';
            case 'qa':
                return 'process-note-task-status-edit-qa';
            case 'billing':
                return 'process-note-task-status-edit-billing';
            default:
                return 'process-note-task-status-edit';
        }
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

export const getRol = async () => {
    try {
        const response = await fetch(`${baseURL}/auth/userinfo`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data.role[0].name;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
export const changeStatusEncounterByUser = async () => {
    try {
        const response = await fetch(`${baseURL}/auth/userinfo`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();

        switch (data.role[0]?.name) {
            case 'scriber':
                return 'process-note-task-status-edit-scriber-bulk';
            case 'qa':
                return 'process-note-task-status-edit-qa-bulk';
            case 'billing':
                return 'process-note-task-status-edit-billing-bulk';
            default:
                return 'process-note-task-status-edit-bulk';
        }
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

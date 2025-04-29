import { Bundle, Practitioner, PractitionerRole } from 'fhir/r4b';
const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';
const baseURL = config.baseURL;
import { compileAsFirst } from '@beda.software/emr/utils';
export const getNameUser = async () => {
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

        return data.role[0]?.name === 'admin'
            ? 'Administrator'
            : getPractitionerNameByID(data.role[0]?.links?.practitioner?.id);
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
export const getPractitionerID = async () => {
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
        const idPractitioner = data.role[0].links.practitioner.id;
        return idPractitioner;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
export const getPractitionerNameByID = async (id: String) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Practitioner/${id}`, {
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

        const fullName = `${data.name[0].given[0]}  ${data.name[0].family}`;
        return fullName;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

export const extractPractitionerRoleByPractitioner = (practitioner: Practitioner) =>
    compileAsFirst<Bundle, PractitionerRole>(
        `Bundle.entry.resource.where(
            resourceType = 'PractitionerRole' 
                and practitioner.reference = 'Practitioner/${practitioner.id}'
        )`,
    );
export const extractEmailByPractitioner = async (practitioner: string) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Role`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        const userId = data.entry
            .map((entry: any) => entry.resource)
            .find((resource: any) => resource.links?.practitioner?.reference === `Practitioner/${practitioner}`)
            ?.user?.reference?.split('/')[1];

        if (!userId) {
            throw new Error('Practitioner not found or missing user reference.');
        }

        const result = await getEmailByUserID(userId);
        return Promise.resolve(result);
    } catch (error) {
        console.error('Error extracting email by practitioner:', error);
        return null;
    }
};

const getEmailByUserID = async (id: String) => {
    try {
        const response = await fetch(`${baseURL}/fhir/User/${id}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.email || null;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
};

export const getAllPractitioner = async () => {
    try {
        const practitionerRoleResponse = await fetch(`${baseURL}/PractitionerRole`, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!practitionerRoleResponse.ok) {
            throw new Error('Error al obtener PractitionerRole');
        }

        const practitionerRolesData = await practitionerRoleResponse.json();
        const practitionerRoles: PractitionerRole[] = practitionerRolesData.entry.map((entry: any) => entry.resource);

        const validRoles = practitionerRoles.filter((role) =>
            role.code?.some((c) => c.coding?.some((coding) => coding.code === 'practitioner')),
        );

        const practitionerIds = [...new Set(validRoles.map((role) => role.practitioner?.id))];
        const practitionerResponses = await Promise.all(
            practitionerIds.map((id) =>
                fetch(`${baseURL}/Practitioner/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }).then((res) => res.json()),
            ),
        );
        return practitionerResponses;
    } catch (error) {
        console.error('Error getting user ID:', error);
        return null;
    }
}

export const getRolByUserID = async (id: String) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Role`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const role = data.entry.filter((data: any) => data?.resource?.links?.practitioner?.reference === `Practitioner/${id}`);
        return role?.[0]?.resource?.name || null;
    } catch (error) {
        console.error('Error getting user Rol:', error);
        return null;
    }
};
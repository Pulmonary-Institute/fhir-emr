import config from '@beda.software/emr-config'
const baseURL = config.baseURL;
//get all Encounters in-progress
const fetchEncounterData = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${baseURL}/fhir/Encounter?status=in-progress`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
const transformEncounterData = (encounter: any) => {
    // Obtener las referencias a los recursos relacionados
    const patientReference = encounter.subject.reference.replace('Patient/', '');
    const locationReference = encounter.location[0]?.location.display;
    const organizationReference = encounter.serviceProvider.display;
    const diagnosisReference = encounter.diagnosis; //save in diagnosisReference a array
    return {
        encounterId: encounter.id,
        patientReferenceID: patientReference,
        room: locationReference,
        facility: organizationReference,
        diagnosisReference: diagnosisReference,
        typeOfCare: encounter.type[0].coding[0].display,
    };
};
//
const fetchRelatedResource = async (resource: String, reference: String) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/fhir/${resource}?id=${reference}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(`Error al obtener el recurso ${reference}`);
    }

    return await response.json();
};
//calculate age
const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const isBirthdayPassed =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
    if (!isBirthdayPassed) {
        age -= 1;
    }
    return age;
};
//create all data
export const fetchAllData = async () => {
    try {
        const encounterResponse = await fetchEncounterData();
        const encounterData = encounterResponse.entry.map((encounter: any) =>
            transformEncounterData(encounter.resource),
        );
        //console.log(encounterData[0].diagnosisReference[0].condition.reference.replace("Condition/", ""))
        const encounterDetails = await Promise.all(
            encounterData.map(async (data: any) => {
                const patient = await fetchRelatedResource('Patient', data.patientReferenceID);
                const dx = await Promise.all(
                    data.diagnosisReference.map(async (diagnosisReference: any) => {
                        const IDCondition = diagnosisReference.condition.reference.replace('Condition/', '');
                        const resultDX = await fetchRelatedResource('Condition', IDCondition);
                        return resultDX.entry[0].resource.code.coding[0].code;
                    }),
                );
                return {
                    ...data,
                    patientName: patient.entry[0].resource.name[0].family,
                    mrn: patient.entry[0].resource.identifier[0].value,
                    dob: patient.entry[0].resource.birthDate,
                    code: patient.entry[0].resource?.extension[0].valueCoding.display,
                    dx: dx,
                    typeOfCare: data.typeOfCare,
                    age: calculateAge(patient.entry[0].resource.birthDate),
                };
            }),
        );

        return encounterDetails;
    } catch (error) {
        console.error('Error fetching encounter details:', error);
        return [];
    }
};

//crear un usuario example
export const createUserExample = async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${baseURL}/fhir/Role`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                resourceType: 'Role',
                id: 'practitioner',
                name: 'admin',
                user: {
                    reference: 'User/practitioner1',
                },
                links: {
                    organization: {
                        reference: 'Organization/beda-emr',
                    },
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

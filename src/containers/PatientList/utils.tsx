const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';
const baseURL = config.baseURL;

import { Account, Bundle, Coding, Coverage, Encounter, FhirResource, Organization } from 'fhir/r4b';

import { resolveReference } from '@beda.software/emr/utils';

import { getCoverageAuthorizationStatus } from 'src/utils-frontend/coverage';

export function getCoverage(resource: Encounter, bundle: Bundle<FhirResource>) {
    const accountRef = resource.account?.[0];
    if (!accountRef) {
        return null;
    }

    const account = resolveReference(bundle, accountRef) as Account | undefined;
    if (!account) {
        return null;
    }

    const coverageRef = account.coverage?.[0]?.coverage;
    if (!coverageRef) {
        return null;
    }

    const coverage = resolveReference(bundle, coverageRef) as Coverage | undefined;
    if (!coverage) {
        return null;
    }

    return coverage;
}

export function getPayerSource(resource: Encounter, bundle: Bundle<FhirResource>) {
    const coverage = getCoverage(resource, bundle);
    if (!coverage) {
        return null;
    }

    const organizationRef = coverage.payor[0];
    if (!organizationRef) {
        return null;
    }

    const organization = resolveReference(bundle, organizationRef) as Organization | undefined;
    if (!organization) {
        return null;
    }

    return organization;
}

export function getAuthorizationStatusTag(coding: Coding) {
    return coding.display;
}

export function getAuthorizationStatus(resource: Encounter, bundle: Bundle<FhirResource>) {
    const coverage = getCoverage(resource, bundle);
    if (!coverage) {
        return null;
    }

    const coding = getCoverageAuthorizationStatus(coverage);

    if (!coding) {
        return null;
    }

    return getAuthorizationStatusTag(coding);
}

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

        return data.role[0].name;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

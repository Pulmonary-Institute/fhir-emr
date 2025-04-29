import { CarePlan, Patient } from 'fhir/r4b';
import { useMemo } from 'react';
import { useParams, Outlet, Route, Routes } from 'react-router-dom';
import { PageContainer, Spinner } from '@beda.software/emr/components';
import { RouteItem } from '@beda.software/emr/dist/components/BaseLayout/Sidebar/SidebarTop/index';
import { PatientReloadProvider } from '@beda.software/emr/dist/containers/PatientDetails/Dashboard/contexts';
import { PatientOverview } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/index';
import {renderHumanName } from '@beda.software/emr/utils';
import { RenderRemoteData } from '@beda.software/fhir-react';
import { isSuccess } from '@beda.software/remote-data';

import { usePatientResource } from './hooks';
export interface PatientDetailsEmbeddedPageDefinition extends RouteItem {
    routes: Array<ReturnType<typeof Route>>;
}

export interface PatientDetailsProps {
    embeddedPages?: (patient: Patient, carePlans: CarePlan[]) => PatientDetailsEmbeddedPageDefinition[];
    isDefaultRoutesDisabled?: boolean;
}

export const FacilityDetails = (props: PatientDetailsProps) => {
    const params = useParams<{ id: string }>();

    const [patientResponse, manager] = usePatientResource({ id: params.id! });
    const embeddedPages = useMemo(() => {
        if (isSuccess(patientResponse)) {
            return props.embeddedPages?.(patientResponse.data.patient, patientResponse.data.carePlans);
        }
    }, [patientResponse]);
console.log('prueba')
    return (
        <RenderRemoteData remoteData={patientResponse} renderLoading={Spinner}>
            {({ patient}) => {
                return (
                    <PatientReloadProvider reload={manager.softReloadAsync}>
                        <PageContainer title={renderHumanName(patient.name?.[0])} variant="with-tabs">
                            <Routes>
                                <Route path="/" element={<><Outlet /></>}>
                                    {!props.isDefaultRoutesDisabled && (<><Route path="/" element={<PatientOverview patient={patient} />} /></>)}
                                    {embeddedPages?.flatMap(({ routes }) => routes)}
                                </Route>
                            </Routes>
                        </PageContainer>
                    </PatientReloadProvider>
                );
            }}
        </RenderRemoteData>
    );
};

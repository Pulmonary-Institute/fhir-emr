import { CarePlan, Patient } from 'fhir/r4b';
import { useMemo } from 'react';
import { useParams, Outlet, Route, Routes } from 'react-router-dom';

import { PageContainer, Spinner } from '@beda.software/emr/components';
import { EncounterDetails } from '@beda.software/emr/containers';
import { RouteItem } from '@beda.software/emr/dist/components/BaseLayout/Sidebar/SidebarTop/index';
import { PatientReloadProvider } from '@beda.software/emr/dist/containers/PatientDetails/Dashboard/contexts';
import { PatientDocument } from '@beda.software/emr/dist/containers/PatientDetails/PatientDocument/index';
import { PatientDocumentDetails } from '@beda.software/emr/dist/containers/PatientDetails/PatientDocumentDetails/index';
import { PatientDocuments } from '@beda.software/emr/dist/containers/PatientDetails/PatientDocuments/index';
import { PatientOverview } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/index';
import { selectCurrentUserRoleResource, renderHumanName } from '@beda.software/emr/utils';
import { RenderRemoteData } from '@beda.software/fhir-react';
import { isSuccess } from '@beda.software/remote-data';

import { usePatientResource } from './hooks';
import { PatientDetailedInfo } from './PatientDetailedInfo';
import { PatientDetailsTabs } from './PatientDetailsTabs';
import { PatientEncounters } from './PatientEncounters';

export interface PatientDetailsEmbeddedPageDefinition extends RouteItem {
    routes: Array<ReturnType<typeof Route>>;
}

export interface PatientDetailsProps {
    embeddedPages?: (patient: Patient, carePlans: CarePlan[]) => PatientDetailsEmbeddedPageDefinition[];
    isDefaultRoutesDisabled?: boolean;
}

export const PatientDetails = (props: PatientDetailsProps) => {
    const params = useParams<{ id: string }>();

    const [patientResponse, manager] = usePatientResource({ id: params.id! });
    const author = selectCurrentUserRoleResource();
    const embeddedPages = useMemo(() => {
        if (isSuccess(patientResponse)) {
            return props.embeddedPages?.(patientResponse.data?.patient, patientResponse.data?.carePlans);
        }
    }, [patientResponse]);

    return (
        <RenderRemoteData remoteData={patientResponse} renderLoading={Spinner}>
            {({ patient, encounter }) => {
                return (
                    <PatientReloadProvider reload={manager.softReloadAsync}>
                        <PageContainer
                            title={renderHumanName(patient.name?.[0])}
                            variant="with-tabs"
                            header={{
                                children: <PatientDetailsTabs />,
                            }}
                            headerRightColumn={<PatientDetailedInfo patient={patient} encounter={encounter} />}
                        >
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        <>
                                            <Outlet />
                                        </>
                                    }
                                >
                                    {!props.isDefaultRoutesDisabled && (
                                        <>
                                            <Route path="/" element={<PatientOverview patient={patient} />} />
                                            <Route
                                                path="/encounters"
                                                element={<PatientEncounters patient={patient} />}
                                            />
                                            <Route
                                                path="/encounters/:encounterId"
                                                element={<EncounterDetails patient={patient} />}
                                            />
                                            <Route
                                                path="/encounters/:encounterId/new/:questionnaireId"
                                                element={<PatientDocument patient={patient} author={author} />}
                                            />
                                            <Route
                                                path="/encounters/:encounterId/:qrId/*"
                                                element={<PatientDocumentDetails patient={patient} />}
                                            />
                                            <Route path="/documents" element={<PatientDocuments patient={patient} />} />
                                            <Route
                                                path="/documents/new/:questionnaireId"
                                                element={<PatientDocument patient={patient} author={author} />}
                                            />
                                            <Route
                                                path="/documents/:qrId/*"
                                                element={<PatientDocumentDetails patient={patient} />}
                                            />
                                        </>
                                    )}
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

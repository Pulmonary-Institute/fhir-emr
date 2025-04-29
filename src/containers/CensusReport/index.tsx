import { t, Trans } from '@lingui/macro';
import { AuditEvent } from 'fhir/r4b';
import _ from 'lodash';
import { Button } from 'antd';
import { ResourceListPage } from '@beda.software/emr/uberComponents';
import { getDateAuditEvent, getCreatedByAuditEvent, buildDataEncounters } from './hook';
export function CensusReport() {
    return (
        <ResourceListPage<AuditEvent>
            headerTitle={t`Audit Log`}
            maxWidth={'100%'}
            resourceType="AuditEvent"
            searchParams={{
                _include: [
                    'AuditEvent:entity:Encounter',
                    'AuditEvent:agent:Practitioner',
                ]
            }}
            
            getTableColumns={() => [
                {
                    title: <Trans>Date</Trans>,
                    dataIndex: 'patient-birthDate',
                    key: 'patient-birthDate',
                    width: 130,
                    render: (_text, { resource }) => {
                        return getDateAuditEvent(resource)
                    },
                },
                {
                    title: <Trans>Created By</Trans>,
                    dataIndex: 'encounter-location',
                    key: 'encounter-location',
                    render: (_text, { resource, bundle }) => {
                        return getCreatedByAuditEvent(resource, bundle)
                    },
                },
                {
                    title: <Trans>Document</Trans>,
                    dataIndex: 'encounter-location',
                    key: 'encounter-location',
                    render: (_text, { resource, bundle }) => {
                        const handleClick = () => {
                            buildDataEncounters(resource, bundle)
                        }
                        return <Button style={{ padding: 0 }} type="link" onClick={handleClick}>
                            Document
                        </Button>
                    },
                },
            ]}
            getReportColumns={(bundle) => [
                {
                    title: t`Total number of Logs`,
                    value: bundle.total ?? 0,
                },
            ]}
        ></ResourceListPage>
    );
}

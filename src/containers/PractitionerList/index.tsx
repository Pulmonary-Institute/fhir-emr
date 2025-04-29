import { useState, useEffect } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Practitioner } from 'fhir/r4b';
import _ from 'lodash';
import { inMemorySaveService } from '@beda.software/emr/hooks';
import { questionnaireAction, ResourceListPage } from '@beda.software/emr/uberComponents';
import { renderHumanName } from '@beda.software/emr/utils';
import { SearchBarColumnType } from '@beda.software/emr/dist/components/SearchBar/types';

import { extractPractitionerRoleByPractitioner, extractEmailByPractitioner } from 'src/utils-frontend/practitioner';

function EmailCell({ practitionerId }: { practitionerId: any }) {
    const [email, setEmail] = useState(null);

    useEffect(() => {
        const fetchEmail = async () => {
            const result = await extractEmailByPractitioner(practitionerId);
            setEmail(result);
        };
        fetchEmail();
    }, [practitionerId]);

    return email;
}

export function PractitionerList() {
    return (
        <ResourceListPage<Practitioner>
            headerTitle={t`Users`}
            resourceType="Practitioner"
            searchParams={{
                _revinclude: 'PractitionerRole:practitioner:Practitioner',
                _sort: 'name',
            }}
            getTableColumns={() => [
                {
                    title: <Trans>Name</Trans>,
                    dataIndex: 'name',
                    key: 'name',
                    render: (_text, { resource }) => renderHumanName(resource.name?.[0]),
                    width: 400,
                },
                {
                    title: <Trans>Email</Trans>,
                    dataIndex: 'email',
                    key: 'email',
                    render: (_text, { resource }) => <EmailCell practitionerId={resource.id} />,
                    width: 200,
                },
                {
                    title: <Trans>Role</Trans>,
                    dataIndex: 'role',
                    key: 'role',
                    render: (_text, { resource, bundle }) => {
                        const practitionerRole = extractPractitionerRoleByPractitioner(resource)(bundle);
                        if (practitionerRole) {
                            return practitionerRole.code?.[0]?.coding?.[0]?.display ?? 'N/A';
                        }
                    },
                    width: 150,
                },
            ]}
            getFilters={() => [
                {
                    id: 'name',
                    searchParam: 'name',
                    type: SearchBarColumnType.STRING,
                    placeholder: t`Search by name`,
                },
            ]}
            getRecordActions={() => [
                questionnaireAction(t`Edit`, 'practitioner-edit'),
                questionnaireAction(t`Change password`, 'practitioner-change-password', {
                    qrfProps: {
                        questionnaireResponseSaveService: inMemorySaveService,
                    },
                }),
                questionnaireAction(t`Remove`, 'practitioner-delete'),
            ]}
            getHeaderActions={() => [
                questionnaireAction(t`Add practitioner`, 'practitioner-create', {
                    icon: <PlusOutlined />,
                    qrfProps: {
                        questionnaireResponseSaveService: inMemorySaveService,
                    },
                }),
            ]}
        ></ResourceListPage>
    );
}

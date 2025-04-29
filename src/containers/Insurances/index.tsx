import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Organization } from 'fhir/r4b';

import { questionnaireAction, ResourceListPage } from '@beda.software/emr/uberComponents';

import { SearchBarColumnType } from '@beda.software/emr/dist/components/SearchBar/types';

export function InsurancesList() {
    return (
        <ResourceListPage<Organization>
            headerTitle={t`Insurances`}
            resourceType="Organization"
            searchParams={{
                _revinclude: 'Location:organization:Organization',
                type: 'ins',
                _sort: '-_lastUpdated',
            }}
            getTableColumns={() => [
                {
                    title: <Trans>Name</Trans>,
                    dataIndex: 'name',
                    key: 'name',
                    width: '80%',
                    render: (_text, { resource }) => {
                        return resource?.name;
                    },
                },
            ]}
            getFilters={() => [
                {
                    id: 'name',
                    searchParam: 'name',
                    type: SearchBarColumnType.STRING,
                    placeholder: t`Choose the Insurances`,
                    expression: 'Organization?type=ins',
                    path: 'name',
                },
            ]}
            getRecordActions={() => [
                questionnaireAction(t`Edit`, 'insurance-edit'),
                questionnaireAction(t`Remove`, 'insurance-delete'),
            ]}
            getReportColumns={(bundle: any) => [
                {
                    title: t`Total number of Insurances`,
                    value: bundle.total ?? 0,
                },
            ]}
            getHeaderActions={() => [
                questionnaireAction(t`Add insurance`, 'insurance-create', {
                    icon: <PlusOutlined />,
                }),
            ]}
        ></ResourceListPage>
    );
}

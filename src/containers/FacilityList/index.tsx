import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Organization } from 'fhir/r4b';

import { questionnaireAction, ResourceListPage } from '@beda.software/emr/uberComponents';

import { extractLocationsByOrganization } from 'src/utils-frontend/organization';

import { EditRoomModal } from './EditRoomModal';
import { S } from './styles';
import { SearchBarColumnType } from '@beda.software/emr/dist/components/SearchBar/types';

export function FacilityList() {
    return (
        <ResourceListPage<Organization>
            headerTitle={t`Facilities`}
            resourceType="Organization"
            searchParams={{
                _revinclude: 'Location:organization:Organization',
                type: 'dept',
                _sort: 'name',
            }}
            getTableColumns={({ reload }) => [
                {
                    title: <Trans>Name</Trans>,
                    dataIndex: 'name',
                    key: 'name',
                    width: '23%',
                    render: (_text, { resource }) => {
                        return resource.name;
                    },
                },
                {
                    title: <Trans>Address</Trans>,
                    dataIndex: 'address',
                    key: 'address',
                    width: '27%',
                    render: (_text, { resource }) => resource.address?.[0]?.text,
                },
                {
                    title: <Trans>Rooms</Trans>,
                    dataIndex: 'type',
                    key: 'type',
                    render: (_text, { resource, bundle }) => {
                        const rooms = extractLocationsByOrganization(resource)(bundle);

                        return (
                            <S.Rooms>
                                {rooms.map((room) => (
                                    <EditRoomModal
                                        key={`edit-room-${room.id}`}
                                        organization={resource}
                                        location={room}
                                        onSuccess={reload}
                                        trigger={<S.LinkButton type="link">{room.name}</S.LinkButton>}
                                    />
                                ))}
                            </S.Rooms>
                        );
                    },
                    width: 400,
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
                questionnaireAction(t`Edit`, 'organization-edit'),
                questionnaireAction(t`Add room`, 'room-create'),
                questionnaireAction(t`Remove`, 'insurance-delete'),
            ]}
            getHeaderActions={() => [
                questionnaireAction(t`Add facility`, 'organization-create', {
                    icon: <PlusOutlined />,
                }),
            ]}
        ></ResourceListPage>
    );
}

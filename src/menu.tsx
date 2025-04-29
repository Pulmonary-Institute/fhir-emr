import { LogoutOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';

import { BottomMenuLayoutValue } from '../dist/components/BaseLayout/Sidebar/SidebarBottom/context';
import { MenuLayoutValue } from '../dist/components/BaseLayout/Sidebar/SidebarTop/context';
import { AvatarImage } from '../dist/images/AvatarImage';
import {
    EncountersIcon,
    OrganizationsIcon,
    PatientsIcon,
    PractitionersIcon,
    SettingsIcon,
    ServicesIcon,
    ScribeIcon,
    DashboardIcon,
    ReportsIcon,
    BillingsIcon,
} from '../dist/icons';
import { doLogout } from '../dist/services/index';
import { sharedAuthorizedUser } from '@beda.software/emr/sharedState';
import { renderHumanName } from '@beda.software/emr/utils';

import { matchCurrentUserRole, Role } from '../src/utils-frontend/role';

export const menuLayout: MenuLayoutValue = () =>
    matchCurrentUserRole({
        [Role.Admin]: () => [
            { label: t`Dashboard`, path: '/home-admin', icon: <DashboardIcon /> },
            { label: t`Encounters`, path: '/scribe', icon: <ScribeIcon /> },
            { label: t`Patients`, path: '/patients', icon: <EncountersIcon /> },
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
            {
                label: t`Setting`,
                icon: <SettingsIcon />,
                key: '/settings',
                children: [
                    { label: t`Users`, path: '/practitioners', key: '/settings-patients', icon: <PractitionersIcon /> },
                    {
                        label: t`Facilities`,
                        path: '/facilities',
                        key: '/settings-facilities',
                        icon: <OrganizationsIcon />,
                    },
                    {
                        label: t`Insurances`,
                        path: '/insurances',
                        key: '/settings-insurances',
                        icon: <ReportsIcon />,
                    },
                    {
                        label: t`Prompts`,
                        path: '/prompts',
                        key: '/settings-prompts',
                        icon: <EncountersIcon />,
                    },
                ],
            },
            // { label: t`Facilities`, path: '/facilities', icon: <OrganizationsIcon /> },
            // { label: t`Users`, path: '/practitioners', icon: <PractitionersIcon /> },
        ],
        [Role.Census]: () => [
            { label: t`Dashboard`, path: '/home-census', icon: <DashboardIcon /> },
            { label: t`Encounters`, path: '/scribe', icon: <ScribeIcon /> },
            { label: t`Facilities`, path: '/facilities', icon: <OrganizationsIcon /> },
            { label: t`Patients`, path: '/patients', icon: <EncountersIcon /> },
            { label: t`Users`, path: '/practitioners', icon: <PractitionersIcon /> },
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
        ],
        [Role.Practitioner]: () => [
            { label: t`Dashboard`, path: '/home-provider', icon: <DashboardIcon /> },
            { label: t`Patients`, path: '/patients', icon: <PatientsIcon /> },
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
        ],
        [Role.Scriber]: () => [
            { label: t`Encounters`, path: '/scribe', icon: <ScribeIcon /> },
            { label: t`Patients`, path: '/patients', icon: <EncountersIcon /> },
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
        ],
        [Role.QA]: () => [
            { label: t`Encounters`, path: '/scribe', icon: <ScribeIcon /> },
            { label: t`Patients`, path: '/patients', icon: <EncountersIcon /> },
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
        ],
        [Role.Billing]: () => [
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
            { label: t`Billing`, path: '/billing', icon: <BillingsIcon /> },
        ],
        [Role.Admin1]: () => [
            { label: t`Dashboard`, path: '/home-admin', icon: <DashboardIcon /> },
            { label: t`Encounters`, path: '/scribe', icon: <ScribeIcon /> },
            { label: t`Facilities`, path: '/facilities', icon: <OrganizationsIcon /> },
            { label: t`Patients`, path: '/patients', icon: <EncountersIcon /> },
            { label: t`Users`, path: '/practitioners', icon: <PractitionersIcon /> },
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
        ],
        [Role.Prm]: () => [
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
            { label: t`Audit Log`, path: '/census-report', icon: <ServicesIcon /> },
        ],
        [Role.Audit]: () => [
            { label: t`Census`, path: '/census', icon: <ServicesIcon /> },
            { label: t`Audit Log`, path: '/census-report', icon: <ServicesIcon /> },
            { label: t`Encounters`, path: '/scribe', icon: <ScribeIcon /> },
            { label: t`Patients`, path: '/patients', icon: <EncountersIcon /> },
        ],
    } as any);

export const bottomMenuLayout: BottomMenuLayoutValue = (onItemClick?: () => void) => {
    const user = sharedAuthorizedUser.getSharedState()!;
    const hasRole = (user?.role || []).length > 0;

    return [
        {
            key: 'user',
            icon: <AvatarImage />,
            label: (
                <>
                    {hasRole
                        ? matchCurrentUserRole({
                              [Role.Admin]: (organization) => organization.name,
                              [Role.Census]: (practitioner) => renderHumanName(practitioner?.name?.[0]),
                              [Role.Practitioner]: (practitioner) => renderHumanName(practitioner?.name?.[0]),
                              [Role.Scriber]: (practitioner) => renderHumanName(practitioner?.name?.[0]),
                              [Role.QA]: (practitioner) => renderHumanName(practitioner?.name?.[0]),
                              [Role.Billing]: (practitioner) => renderHumanName(practitioner?.name?.[0]),
                              [Role.Admin1]: (practitioner) => renderHumanName(practitioner?.name?.[0]),
                              [Role.Prm]: (practitioner) => renderHumanName(practitioner?.name?.[0]),
                              [Role.Audit]: (practitioner) => renderHumanName(practitioner?.name?.[0]),
                          })
                        : user?.email}
                </>
            ),
            children: [
                {
                    label: t`Log out`,
                    key: 'logout',
                    onClick: () => {
                        doLogout();
                        onItemClick?.();
                    },
                    icon: <LogoutOutlined />,
                },
            ],
        },
    ];
};

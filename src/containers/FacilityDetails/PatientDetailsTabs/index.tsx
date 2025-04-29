import { t } from '@lingui/macro';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';

import { Tabs } from '@beda.software/emr/components';
import { RouteItem } from '@beda.software/emr/dist/components/BaseLayout/Sidebar/SidebarTop/index';

export function PatientDetailsTabs(props: { extraMenuItems?: RouteItem[]; isDefaultRoutesDisabled?: boolean }) {
    const location = useLocation();
    const params = useParams<{ id: string }>();
    const { extraMenuItems = [] } = props;
    const navigate = useNavigate();

    const menuItems: RouteItem[] = useMemo(
        () =>
            (!props.isDefaultRoutesDisabled
                ? [
                      { label: t`Overview`, path: `/patients/${params.id}` },
                      { label: t`Encounters`, path: `/patients/${params.id}/encounters` },
                      { label: t`Forms`, path: `/patients/${params.id}/documents` },
                  ]
                : []
            ).concat(
                extraMenuItems.map(({ label, path }) => ({
                    label,
                    path: `/patients/${params.id}` + path,
                })),
            ),
        [props.isDefaultRoutesDisabled, params.id, extraMenuItems],
    );

    const [currentPath, setCurrentPath] = useState(location?.pathname);

    useEffect(() => {
        setCurrentPath(location?.pathname);
    }, [location]);

    return (
        <Tabs
            boxShadow={false}
            activeKey={currentPath ? currentPath.split('/').slice(0, 4).join('/') : ''}
            items={menuItems.map((route) => ({
                key: route.path || '',
                label: <Link to={route.path || '/'}>{route.label}</Link>,
            }))}
            onTabClick={(path) => navigate(path)}
        />
    );
}

import { Menu, MenuProps } from 'antd';
import classNames from 'classnames';
import { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { LogoSmall } from 'src/icons/brand/LogoSmall';
import { LogoLarge } from 'src/icons/brand/LogoLarge';
import { getToken } from 'src/services/auth';

import { MenuLayout } from './context';
import s from './SidebarTop.module.scss';
import { S } from './SidebarTop.styles';

export interface RouteItem {
    children?: RouteItem[];
    path?: string;
    exact?: boolean;
    label: string;
    icon?: React.ReactElement;
    disabled?: boolean;
    className?: string;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    collapsed: boolean;
    onItemClick?: () => void;
}

export function SidebarTop(props: Props) {
    const location = useLocation();
    const appToken = getToken();
    const isAnonymousUser = !appToken;
    const { collapsed, onItemClick, ...other } = props;
    const navigate = useNavigate();
    const layout = useContext(MenuLayout);

    const menuItems: any = !isAnonymousUser ? layout() : [];

    const activeMenu = `/${location.pathname.split('/')[1]}`;
    const onMenuItemClick = (path?: string) => {
        if (path) {
            onItemClick?.();
            navigate(path);
        }
    };

    return (
        <S.Container $collapsed={collapsed} className={classNames(s.container, { _collapsed: collapsed })} {...other}>
            <Link to="/" className={s.logoWrapper}>
                {collapsed ? <LogoSmall width={90} height={90} /> : <LogoLarge height={100} />}
            </Link>
            <S.Divider />
            <Menu
                mode="inline"
                theme="light"
                selectedKeys={[activeMenu!]}
                items={renderTopMenu(menuItems, onMenuItemClick, collapsed)}
                className={s.menu}
                inlineCollapsed={collapsed} // Ensure correct behavior when collapsed
            />
        </S.Container>
    );
}

// Define the type for the menu items
type MenuItem = Required<MenuProps>['items'][number];

function renderTopMenu(menuRoutes: RouteItem[], onItemClick: (path?: string) => void, collapsed: boolean): MenuItem[] {
    return menuRoutes.map((route) => {
        if (route.children && route.children.length > 0) {
            return {
                key: route.label,
                icon: route.icon,
                label: collapsed ? (
                    route.label
                ) : (
                    <div className={s.menuLink}>
                        <span className={s.menuItemLabel}>{route.label}</span>
                        <span className={classNames(s.menuItemLabel, s._small)}>{route.label}</span>
                    </div>
                ),
                className: s.menuItem,
                children: renderTopMenu(route.children, onItemClick, collapsed),
            };
        }

        return {
            key: route.path!,
            icon: route.icon,
            label: collapsed ? (
                route.label
            ) : (
                <div className={s.menuLink}>
                    <span className={s.menuItemLabel}>{route.label}</span>
                    <span className={classNames(s.menuItemLabel, s._small)}>{route.label}</span>
                </div>
            ),
            className: s.menuItem,
            onClick: () => onItemClick(route.path),
        };
    });
}

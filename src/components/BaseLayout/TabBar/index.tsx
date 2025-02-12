import { CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { LogoLarge } from 'src/icons/brand/LogoLarge';
import { MenuIcon } from 'src/icons/general/Menu';

import { S } from './TabBar.styles';
import { SidebarBottom } from '../Sidebar/SidebarBottom';
import { SidebarTop } from '../Sidebar/SidebarTop';

export function AppTabBar() {
    const [menuOpened, toggleMenuOpened] = useState(false);

    return (
        <>
            <S.TabBar>
                <S.LogoWrapper to="/">
                    <LogoLarge height={100} />
                </S.LogoWrapper>
                <S.Button icon={<MenuIcon />} type="text" onClick={() => toggleMenuOpened((v) => !v)} />
            </S.TabBar>
            <S.Drawer placement="left" onClose={() => toggleMenuOpened(false)} open={menuOpened} closable={false}>
                <S.CloseIcon type="text" icon={<CloseOutlined />} onClick={() => toggleMenuOpened(false)} />
                <SidebarTop collapsed={false} onItemClick={() => toggleMenuOpened(false)} />
                <SidebarBottom collapsed={false} onItemClick={() => toggleMenuOpened(false)} />
            </S.Drawer>
        </>
    );
}

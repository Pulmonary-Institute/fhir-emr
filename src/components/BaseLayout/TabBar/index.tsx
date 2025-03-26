import { CloseOutlined } from '@ant-design/icons';
import { Button } from 'antd'; // Make sure to import Button
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
                    <LogoLarge height={60} />
                </S.LogoWrapper>
                <S.Button icon={<MenuIcon />} type="text" onClick={() => toggleMenuOpened((v) => !v)} />
            </S.TabBar>
            <S.Drawer placement="left" onClose={() => toggleMenuOpened(false)} open={menuOpened} closable={false}>
                {/* Replace S.CloseIcon with a direct Button component */}
                <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    onClick={() => toggleMenuOpened(false)}
                    style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
                />
                <SidebarTop collapsed={false} onItemClick={() => toggleMenuOpened(false)} />
                <SidebarBottom collapsed={false} onItemClick={() => toggleMenuOpened(false)} />
            </S.Drawer>
        </>
    );
}
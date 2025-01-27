import { Layout } from 'antd';
import styled from 'styled-components';

const { Sider } = Layout;

export const S = {
    Container: styled.div`
        transition: all 0.2s;

        @media screen and (max-width: 767px) {
            display: none;
        }
    `,
    Sidebar: styled(Sider)`
        position: fixed !important;
        overflow: auto;
        top: 0;
        left: 0;
        bottom: 0;
        border-right: 1px solid ${({ theme }) => theme.antdTheme?.colorBorderSecondary};
        z-index: 1;
        background: rgba(255, 255, 255, 0.2) !important;
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        margin: 1vh;
    `,
    SidebarContent: styled.div`
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow-x: hidden;
    `,
};

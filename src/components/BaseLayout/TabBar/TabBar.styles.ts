import { Button, Drawer } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const S = {
    TabBar: styled.div`
        position: fixed;
        height: 50px;
        left: 0;
        right: 0;
        top: 0;
        z-index: 11;
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        margin: 1vh;
        

        @media screen and (min-width: 768px) {
            display: none;
        }
    `,
    LogoWrapper: styled(Link)`
        height: 50px;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 0 24px;
        transition: padding 0.2s;
    `,
    CloseIcon: styled(Button)`
        position: absolute;
        right: 0;
        top: 0;
        height: 68px;
        width: 68px !important;
        color: ${({ theme }) => theme.neutralPalette.gray_7} !important;

        &:hover {
            background: 0 !important;
        }

        svg {
            width: 18px;
            height: 18px;
        }
    `,
    Button: styled(Button)`
        height: 50px;
        width: 75px !important;
        padding: 0 !important;

        &:hover {
            background: 0 !important;
        }

        svg {
            width: 18px;
            height: 18px;
        }
    `,
    Drawer: styled(Drawer)`
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        margin: 1vh;



        .ant-drawer-body {
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
    `,
};

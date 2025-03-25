import { Button, Drawer, Table } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const S = {
    TabBar: styled.div`
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 60px;
        z-index: 1000;
        display: flex;
        justify-content: space-around;
        align-items: center;
        background: rgba(255, 255, 255, 0.9);
        border-radius: 16px 16px 0 0;
        box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(10px);
        border-top: 1px solid rgba(255, 255, 255, 0.3);
        padding: 8px;

        @media screen and (min-width: 768px) {
            display: none;
        }
    `,

    LogoWrapper: styled(Link)`
        height: 50px;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 0 16px;
        transition: padding 0.2s;
    `,

    Button: styled(Button)`
        height: 50px;
        width: 75px;
        padding: 0;
        background: transparent;
        border: none;

        &:hover {
            background: rgba(0, 0, 0, 0.05);
        }

        svg {
            width: 24px;
            height: 24px;
        }
    `,

    Drawer: styled(Drawer)`
        .ant-drawer-content-wrapper {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            height: 80vh !important;
            border-radius: 16px 16px 0 0;
            overflow: hidden;
        }

        .ant-drawer-content {
            border-radius: 16px 16px 0 0;
            height: 100% !important;
            display: flex;
            flex-direction: column;
            background: rgba(255, 255, 255, 0.95);
        }

        .ant-drawer-body {
            flex-grow: 1;
            overflow-y: auto;
            padding: 16px;
        }
    `,

    ResponsiveTable: styled(Table)`
        width: 100%;
        .ant-table {
            min-width: 100%;
        }
        @media screen and (max-width: 767px) {
            .ant-table-container {
                overflow-x: auto;
            }
            .ant-table-cell {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
    `,

    TableContainer: styled.div`
        width: 100%;
        overflow-x: auto;
        box-sizing: border-box;
        @media screen and (max-width: 767px) {
            padding: 0 8px;
        }
    `,

    DrawerContent: styled.div`
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        box-sizing: border-box;
    `,

    DrawerFooter: styled.div`
        padding: 12px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        background: rgba(255, 255, 255, 0.9);
        border-radius: 0 0 16px 16px;
    `,
};
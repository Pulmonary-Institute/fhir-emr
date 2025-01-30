import { Divider } from 'antd';
import styled from 'styled-components';

export const S = {
    Container: styled.div<{ $collapsed: boolean }>`
        display: flex;
        flex-direction: column;
        padding: 0 4px;
        gap: 4px;

        .ant-menu {
            background: 0 !important;
        }

        .ant-menu-item {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: ${({ $collapsed }) => ($collapsed ? 'column' : 'row')};
            gap: 0 10px;
            line-height: 24px !important;
            width: 100% !important;
            margin: 0 !important;
            color: ${({ theme }) => theme.neutral.primaryText} !important;
            border-radius: 6px !important;
            transition: height 0.2s;
            transition: all 0.2s;
        }

        .ant-menu-item-icon {
            min-width: 24px !important;
            min-height: 24px !important;
        }

        .ant-menu-title-content {
            margin: 0 !important;
            opacity: 1 !important;
        }

        .ant-menu-item:hover:not(.ant-menu-item-selected) {
            background: 0 !important;
            color: ${({ theme }) => theme.primary} !important;
        }

        .ant-menu-item.ant-menu-item-selected {
            background-color: hsla(0,0%,100%,0.5)!important;
            color: #00000 !important;
        }
    `,
    Divider: styled(Divider)`
        margin: 0;
    `,
};

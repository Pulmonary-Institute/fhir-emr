import { Button, Drawer, Table } from 'antd';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const S = {
    TabBar: styled.div`
        position: fixed;
        height: 50px;
        left: 0;
        right: 0;
        top: 0;
        z-index: 1000;
        display: flex;
        flex-direction: row-reverse;
        justify-content: space-between;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        margin: 8px;

        @media screen and (min-width: 768px) {
            display: none;
        }
    `,

    LogoWrapper: styled(Link)`
        height: 50px;
        width: 350px;
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
        border-radius: 16px;  /* Alterado para aplicar em todos os cantos */
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        margin: 16px;  /* Margem uniforme em todos os lados */
        overflow: hidden;  /* Impede que o conteúdo ultrapasse as bordas */

        .ant-drawer-content {
            border-radius: 16px !important;  /* Força bordas arredondadas */
            height: 100% !important;
            overflow: hidden;  /* Impede que o conteúdo ultrapasse */
        }

        .ant-drawer-body {
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            flex-grow: 1 !important;
            overflow-y: auto !important;
            height: 100%;
            padding-bottom: env(safe-area-inset-bottom);
        }

        @media screen and (max-width: 480px) {
            .ant-drawer-content-wrapper {
                inset: 10% !important; /* Aplica espaçamento uniforme */
                height: auto !important;
                max-height: 80vh !important;
                max-width: 80% !important;
                margin: 0 auto !important;  /* Centraliza horizontalmente */
                position: fixed !important;
            }

            .ant-drawer-content {
                border-radius: 16px !important;  /* Bordas arredondadas em todos os cantos */
                height: 100% !important;
                margin-bottom: 0 !important;
            }
        }
    `,

    ResponsiveTable: styled(Table)`
        width: 100%;

        .ant-table {
            min-width: 100%;
        }

        @media screen and (max-width: 767px) {
            .ant-table-wrapper {
                overflow-x: auto;
                width: 100%;
                max-width: 100%;
            }

            .ant-table-container {
                overflow-x: auto;
                width: 100%;
            }

            .ant-table-cell {
                padding: 8px 6px;
                white-space: nowrap;
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .ant-table {
                font-size: 14px;
                table-layout: fixed;
                max-width: 100%;
            }
        }
    `,

    TableContainer: styled.div`
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        box-sizing: border-box;

        @media screen and (max-width: 767px) {
            margin: 0;
            padding: 0 8px;
            height: auto;
            max-height: calc(100vh - 100px);
            overflow-y: auto;
            max-width: 100%;
            width: 100%;
        }
    `,

    DrawerContent: styled.div`
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        padding: 16px 16px calc(16px + env(safe-area-inset-bottom)) 16px;
        width: 100%;
        box-sizing: border-box;
        height: calc(100% - 60px);  /* Ajustado para dar espaço ao footer */

        @media screen and (max-width: 767px) {
            padding: 12px 8px calc(12px + env(safe-area-inset-bottom)) 8px;
            max-width: 100%;
        }
    `,

    DrawerFooter: styled.div`
        padding: 12px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        background: rgba(255, 255, 255, 0.8);
        border-radius: 0 0 16px 16px;  /* Adiciona cantos arredondados apenas na parte inferior */
        margin-top: 100%;  /* Empurra para o final do container */

        @media screen and (max-width: 767px) {
            padding: 8px;
        }
    `,
};
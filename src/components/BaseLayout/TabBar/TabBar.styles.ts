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
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        margin: 8px;

        .ant-drawer-body {
            padding: 0;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        
        // Fix for both bottom and right overflow
        .ant-drawer-content-wrapper {
            max-height: calc(100% - 16px) !important;
            bottom: 8px !important;
            right: 8px !important;
            max-width: calc(100% - 16px) !important;
        }
        
        // Ensures the drawer content is scrollable when needed
        .ant-drawer-content {
            overflow: hidden;
            display: flex;
            flex-direction: column;
            border-radius: 16px;
            width: 100%;
        }
    `,

    ResponsiveTable: styled(Table)`
        width: 100%;
        
        .ant-table {
            min-width: 100%;
        }
        
        // Ajustes para dispositivos móveis
        @media screen and (max-width: 767px) {
            .ant-table-wrapper {
                overflow-x: auto;
                width: 100%;
                max-width: 100%;
            }
            
            // Permite rolagem horizontal
            .ant-table-container {
                overflow-x: auto;
                width: 100%;
            }
            
            // Reduz o padding das células para economizar espaço
            .ant-table-cell {
                padding: 8px 6px;
                white-space: nowrap;
                max-width: 200px;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            
            // Ajusta o tamanho da fonte para melhor legibilidade
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
        -webkit-overflow-scrolling: touch; /* Para suporte ao iOS */
        box-sizing: border-box;
        
        @media screen and (max-width: 767px) {
            margin: 0;
            padding: 0 8px;
            height: auto;
            max-height: calc(100vh - 100px); /* Altura máxima para evitar overflow */
            overflow-y: auto;
            max-width: 100%;
            width: 100%;
        }
    `,
    
    // Novo componente para garantir que o conteúdo do drawer seja scrollável
    DrawerContent: styled.div`
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        padding: 16px;
        width: 100%;
        box-sizing: border-box;
        
        @media screen and (max-width: 767px) {
            padding: 12px 8px;
            max-width: 100%;
        }
    `,
    
    // Componente opcional para um footer fixo no drawer se necessário
    DrawerFooter: styled.div`
        padding: 12px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        background: rgba(255, 255, 255, 0.8);
        
        @media screen and (max-width: 767px) {
            padding: 8px;
        }
    `,
};
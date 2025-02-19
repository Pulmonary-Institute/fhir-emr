import { mobileWidth } from 'src/theme/utils';
import styled, { css } from 'styled-components';

export const S = {
    Table: styled.div<{ $showCardsOnMobile?: boolean }>`
        overflow: auto;
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(5px);
        margin-bottom: 30px;

        ${({ $showCardsOnMobile }) =>
            $showCardsOnMobile &&
            css`
                @media screen and (max-width: ${() => `${mobileWidth - 1}px`}) {
                    display: none;
                }
            `}

        .ant-spin-container {
            min-width: fit-content;
            border-radius: 16px;
        }

        .ant-table {
            min-width: fit-content;
            table-layout: fixed;
            width: 100%;
            background: none;!important;
            
        }

        .ant-table-container {
            min-width: fit-content;
            border-radius: 16px;
        }

        .ant-table-content {
            min-width: fit-content;
        }

        .ant-table-thead .ant-table-cell {
            background-color: none;
        }
        
        .ant-table-cell {
             max-width: 270px;
             max-height: 10px; 
             white-space: nowrap;
             word-break: break-word;
             overflow-y: auto;
        }
    `,
    Cards: styled.div<{ $showCardsOnMobile?: boolean }>`
        ${({ $showCardsOnMobile }) =>
            $showCardsOnMobile &&
            css`
                @media screen and (min-width: ${() => `${mobileWidth}px`}) {
                    display: none;
                }
            `}
    `,
};

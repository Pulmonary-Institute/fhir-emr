import { mobileWidth } from 'src/theme/utils';
import styled, { css } from 'styled-components';

export const S = {
    Table: styled.div<{ $showCardsOnMobile?: boolean }>`
        overflow: auto;

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
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .ant-table-container {
            min-width: fit-content;
            border-radius: 16px;
        }

        .ant-table-content {
            min-width: fit-content;
        }

        .ant-table-thead .ant-table-cell {
            background-color: ${({ theme }) => theme.neutralPalette.gray_2};
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

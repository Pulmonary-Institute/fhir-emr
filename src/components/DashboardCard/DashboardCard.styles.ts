import styled from 'styled-components';

export const S = {
    Wrapper: styled.div`
        overflow-x: auto;
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
    `,
    Card: styled.div`
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(5px);
        color: ${({ theme }) => theme.neutralPalette.gray_13};
        min-width: fit-content;

        &._empty {
            color: ${({ theme }) => theme.neutralPalette.gray_6};
        }
    `,
    Header: styled.div`
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        & > * {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    `,
    Title: styled.div`
        font-size: 16px;
        line-height: 24px;
        font-weight: bold;
    `,
    Icon: styled.div`
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #5eaceb;
        width: 48px;
        height: 48px;
        min-width: 48px;
        border-radius: 50%;
        color: #fff;
        font-size: 24px;

        &._empty {
            background-color: ${({ theme }) => theme.primaryPalette.bcp_2};
        }
    `,
    Content: styled.div`
        border-top: 1px solid ${({ theme }) => theme.antdTheme?.colorBorderSecondary};
        font-size: 14px;
        line-height: 22px;
    `,
    TableHeader: styled.div`
        font-weight: 700;
        display: flex;
        justify-content: space-between;
        align-items: stretch;
    `,
    TableRow: styled.div`
        display: flex;
        justify-content: space-between;
        align-items: stretch;
        border-top: 1px solid ${({ theme }) => theme.antdTheme?.colorBorderSecondary};

        &:first-child {
            border-left: 0;
        }
    `,
    TableCell: styled.div`
        display: flex;
        align-items: center;
        padding: 13px 12px;
        border-left: 1px solid ${({ theme }) => theme.antdTheme?.colorBorderSecondary};

        &:first-child {
            border-left: 0;
        }
    `,
    TableCellLabel: styled.div`
    font-weight: bold;
    margin-right: 10px;
`,
    TableCellValue: styled.div`
    flex-grow: 1;
    text-align: right;
`,
};
export const S1 = {
    Wrapper: styled.div`
        overflow-x: auto;
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.3);
    `,
    Card: styled.div`
        border-radius: 16px;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(5px);
        color: ${({ theme }) => theme.neutralPalette.gray_13};
        min-width: fit-content;
        &._empty {
            color: ${({ theme }) => theme.neutralPalette.gray_6};
        }
    `,
    Header: styled.div`
        padding: 10px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        & > * {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    `,
    Content: styled.div`
        border-top: 1px solid ${({ theme }) => theme.antdTheme?.colorBorderSecondary};
        font-size: 14px;
        line-height: 22px;
        display: flex;
        flex-direction: column;
        gap: 10px; // Espacio entre filas
    `,
    TableRow: styled.div`
        display: flex;
        flex-direction: column;
        border-top: 1px solid ${({ theme }) => theme.antdTheme?.colorBorderSecondary};
        padding: 10px;
    `,
    TableCell: styled.div`
      display: flex;
        align-items: center;
        padding: 13px 12px;
        border-bottom: 1px solid ${({ theme }) => theme.antdTheme?.colorBorderSecondary};
    `,
    TableCellLabel: styled.div`
        font-weight: bold;
        margin-right: 10px;
    `,
    TableCellValue: styled.div`
        flex-grow: 1;
        text-align: right;
    `,
};

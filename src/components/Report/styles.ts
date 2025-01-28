import styled, { css } from 'styled-components';
import { Text } from '../Typography';

export const S = {
    Container: styled.div<{ $fullWidth?: boolean }>`
        display: flex;
        justify-content: flex-start;
        gap: 16px 40px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        width: fit-content;

        ${({ $fullWidth }) =>
            $fullWidth &&
            css`
                width: auto;
                justify-content: space-between;
            `}
    `,
    Item: styled.div`
        display: flex;
        flex-direction: column;
        gap: 4px 0;
    `,
    Label: styled(Text)`
        font-size: 12px;
        line-height: 20px;
        color: ${({ theme }) => theme.neutralPalette.gray_7};
    `,
    Value: styled(Text)`
        font-weight: 700;
    `,
};

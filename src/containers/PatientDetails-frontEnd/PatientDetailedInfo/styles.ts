import styled from 'styled-components';

export const S = {
    Details: styled.div`
        display: flex;
        align-items: center;
        gap: 12px 24px;
        height: 40px;
        white-space: nowrap;
        flex-wrap: wrap;
    `,
    DetailsItem: styled.div`
        display: flex;
        align-items: center;
        gap: 0 8px;
    `,
    Icon: styled.div`
        font-size: 16px;
        color: ${({ theme }) => theme.neutral.secondaryText};
    `,
};

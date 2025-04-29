import { Button } from 'antd';
import styled from 'styled-components';

export const S = {
    PageHeader: styled.div`
        background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 30px;
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        display: flex;
        flex-direction: column;
        padding: 32px 24px;
        align-items: center;
        z-index: 100;
        margin-bottom: 50px;
    `,

    HeaderContainer: styled.div`
        display: flex;
        justify-content: space-between;
        width: 100%;
    `,

    Title: styled.h3`
        color: rgba(0, 0, 0, 0.88);
        font-weight: 600;
        font-size: 24px;
        line-height: 1.33;
    `,

    ButtonContainer: styled.div`
        display: flex;
        gap: 15px;
        @media (max-width: 768px) {
            display: flex;
            justify-content: flex-end;
            width: 100%;
        }
    `,

    Button: styled(Button)`
        padding: 0;
    `,

    TableContainer: styled.div`
        @media (max-width: 768px) {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
    `,

    Card: styled.div`
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);

        @media (max-width: 768px) {
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding: 12px;
        }
    `,

    CardItem: styled.div`
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #f0f0f0;
        padding: 8px 0;

        &:last-child {
            border-bottom: none;
        }

        span {
            font-weight: 600;
        }
    `,
};

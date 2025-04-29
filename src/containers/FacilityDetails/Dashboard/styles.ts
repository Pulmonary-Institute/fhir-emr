import { Button } from 'antd';
import styled from 'styled-components';

export const S = {
    Buttons: styled.div`
        display: flex;
        align-items: center;
        gap: 0 16px;
    `,
    Button: styled(Button)`
        padding: 0;
        font-weight: 600;
    `,
};

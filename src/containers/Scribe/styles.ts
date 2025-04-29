import { Button } from 'antd';
import styled, { css } from 'styled-components';

import { Text } from '@beda.software/emr/components';

export const S = {
    Button: styled(Button)`
        padding: 0;
    `,
    DueDate: styled(Text)<{ $outdated: boolean }>`
        ${({ $outdated }) => $outdated && css`
            color: ${({ theme }) => theme.error};
        `}
    `
};

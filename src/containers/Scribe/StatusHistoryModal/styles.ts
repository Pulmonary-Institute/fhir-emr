import { Button } from 'antd';
import styled from 'styled-components';

import { ChangesDiff } from '@beda.software/emr/components';

export const S = {
    ChangesDiff: styled(ChangesDiff)`
        display: flex;
        flex-direction: column;
        gap: 24px 0;
    `,
    Button: styled(Button)`
        padding: 0;
    `,
};

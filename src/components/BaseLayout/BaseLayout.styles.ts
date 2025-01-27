import { Layout } from 'antd';
import { isNumber, isString } from 'lodash';
import styled, { css } from 'styled-components';

const maxWidthStyles = css<{ $maxWidth?: number | string }>`
    ${({ $maxWidth }) => {
        if (isNumber($maxWidth)) {
            return css`
                max-width: ${() => `${$maxWidth}px`};
            `;
        }

        if (isString($maxWidth)) {
            return css`
                max-width: ${() => `${$maxWidth}`};
            `;
        }

        return css`
            max-width: '100%' ;
        `;
    }}
`;

export const S = {
    Container: styled(Layout)`
        min-height: 100vh;
        position: relative;
        background-color:hsla(0,0%,100%,1);
        background-image:
            radial-gradient(at 79% 34%, hsla(28,100%,74%,0.33) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(206,77%,64%,0.36) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(355,100%,93%,0.55) 0px, transparent 50%),
            radial-gradient(at 52% 41%, hsla(266,60%,69%,0.19) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(44,96%,50%,0.21) 0px, transparent 50%),
            radial-gradient(at 80% 100%, hsla(240,100%,70%,0.23) 0px, transparent 50%),
            radial-gradient(at 5% 8%, hsla(273,87%,90%,0.4) 0px, transparent 50%);

        @media screen and (max-width: 767px) {
            padding-top: 50px;
        }
    `,
    Layout: styled(Layout)`
        background: 0;
        position: relative;
        padding-bottom: 64px;
    `,
    PageHeaderContainer: styled.div`
       background: rgba(255, 255, 255, 0.2);
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        display: flex;
        flex-direction: column;
        padding: 0 24px;
        align-items: center;
        margin: 3vh;
    `,
    PageHeader: styled.div<{ $maxWidth?: number | string }>`
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 24px 0;
        gap: 32px 0;
        width: 100%;

        ${maxWidthStyles}
    `,
    PageContentContainer: styled.div`
        padding: 0 24px;
        display: flex;
        flex-direction: column;
        align-items: center;
    `,
    PageContent: styled.div<{ $maxWidth?: number | string }>`
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 24px 0;
        width: 100%;

        ${maxWidthStyles}
    `,
};

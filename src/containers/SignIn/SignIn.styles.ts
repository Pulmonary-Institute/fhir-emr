import styled from 'styled-components';

import { Text } from 'src/components/Typography';

export const S = {
    Container: styled.div`
        min-height: 100vh;
        position: relative;
        padding: 0 16px 64px;
        background-color:hsla(0,0%,100%,1);
        background-image:
            radial-gradient(at 79% 34%, hsla(28,100%,74%,0.33) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(206,77%,64%,0.36) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(355,100%,93%,0.55) 0px, transparent 50%),
            radial-gradient(at 52% 41%, hsla(266,60%,69%,0.19) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsla(44,96%,50%,0.21) 0px, transparent 50%),
            radial-gradient(at 80% 100%, hsla(240,100%,70%,0.23) 0px, transparent 50%),
            radial-gradient(at 5% 8%, hsla(273,87%,90%,0.4) 0px, transparent 50%);
        flex-direction: column;
        align-items: center;
        padding-top: 40vh;
        display: flex;
    `,
    Form: styled.div`
        display: flex;
        flex-direction: column;
        max-width: 390px;
        width: 100%;
        padding: 16px;
        background: rgba(255, 255, 255, 0.2) !important;
        border-radius: 16px;
        box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        gap: 32px;
        border-radius: 16px;
    `,
    Text: styled(Text)`
        margin: 0;
        font-weight: 700;
        font-size: 19px;
        line-height: 26px;
    `,
    Message: styled.div`
        background-color: ${({ theme }) => theme.neutralPalette.gray_2};
        color: ${({ theme }) => theme.neutralPalette.gray_13};
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px;
        font-size: 14px;
        line-height: 22px;
    `,
    CredentialsWrapper: styled.div`
        display: flex;
        flex-direction: column;
        gap: 8px;
    `,
    CredentialsBlock: styled.div`
        display: flex;
        flex-direction: column;
    `,
    CredentialsList: styled.div`
        display: flex;
        flex-direction: row;
        gap: 4px;
    `,
    CredentialLabel: styled.span`
        font-weight: bold;
    `,
    CredentialName: styled.span`
        text-decoration: underline dotted;
    `,
    ButtonsWrapper: styled.div`
        display: flex;
        flex-direction: column;
        gap: 16px;
    `,
};

import { t } from '@lingui/macro';
import { Button } from 'antd';
import { useState } from 'react';

import { AppFooter } from 'src/components/BaseLayout/Footer';
import logo from 'src/images/vertical-logo.svg';
import { getAuthorizeUrl, OAuthState } from 'src/services/auth';

import { useAppleAuthentication } from './hooks';
import s from './SignIn.module.scss';
import { S } from './SignIn.styles';

enum SignInService {
    EMR = 'EMR',
    PatientPortal = 'Patient Portal',
}

function authorize(state?: OAuthState) {
    window.location.href = getAuthorizeUrl(state);
}

interface SignInProps {
    originPathName?: string;
}

export function SignIn({ originPathName }: SignInProps) {
    const [signInService, setSignInService] = useState<string>(SignInService.EMR);

    return (
        <S.Container>
            <S.Form>
                <div className={s.header}>
                    <img src={logo} alt="Company Logo" style={{ width: '400px', height: '100px' }} />
                </div>
                <Button
                    type="primary"
                    onClick={() => authorize({ nextUrl: originPathName })}
                    size="large"
                >
                    {t`Log in`}
                </Button>
            </S.Form>
            <AppFooter type="light" />
        </S.Container>
    );
}

function AppleButton() {
    useAppleAuthentication();

    return (
        <div
            className={s.appleSignInBtn}
            id="appleid-signin"
            data-color="black"
            data-border="true"
            data-type="sign-in"
        />
    );
}

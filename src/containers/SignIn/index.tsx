import { Button } from 'antd';
import { t } from '@lingui/macro';
import logo from 'src/images/vertical-logo.svg';
import { getAuthorizeUrl, OAuthState } from 'src/services/auth';
import s from './SignIn.module.scss';
import { S } from './SignIn.styles';

function authorize(state?: OAuthState) {
    window.location.href = getAuthorizeUrl(state);
}

interface SignInProps {
    originPathName?: string;
}

export function SignIn(props: SignInProps) {
    return (
        <S.Container>
            <S.Form>
                <div className={s.header}>
                    <img src={logo} alt="Logo" style={{ width: '270px', height: '100px' }} />
                </div>
                <Button type="primary" onClick={() => authorize({ nextUrl: props.originPathName })} size="large">
                    {t`Log in`}
                </Button>
            </S.Form>
        </S.Container>
    );
}

import { AppFooter } from 'src/components/BaseLayout/Footer';
import { LogoSmall } from 'src/icons/brand/LogoSmall';

import { NotificationPageProps } from './interfaces';
import { S } from './NotificationPage.styles';

export function NotificationPage(props: NotificationPageProps) {
    return (
        <S.Container>
            <S.Link to="/">
                <LogoSmall width={50} height={50} />
            </S.Link>
            <S.Title>{props.title}</S.Title>
            <S.TextContainer>
                <S.Text>{props.text}</S.Text>
            </S.TextContainer>
            <AppFooter type="light" />
        </S.Container>
    );
}

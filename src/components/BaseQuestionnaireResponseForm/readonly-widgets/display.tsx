import classNames from 'classnames';
import { QuestionItemProps } from 'sdc-qrf';

import s from './ReadonlyWidgets.module.scss';
import { S } from './ReadonlyWidgets.styles';
import { TextWithLink } from '../widgets/display';

export function Display({ questionItem }: QuestionItemProps) {
    const { text, hidden } = questionItem;

    if (hidden) {
        return null;
    }

    return (
        <S.Question className={classNames(s.question, s.column, 'form__question')}>
            <span className={s.questionText}>
                <TextWithLink text={text} />
            </span>
        </S.Question>
    );
}

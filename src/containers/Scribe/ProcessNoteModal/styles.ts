import { Button } from 'antd';
import styled from 'styled-components';

const footerHeight = 56;

export const S = {
    Container: styled.div`
        display: flex;

        &:after {
            content: '';
            display: block;
            position: absolute;
            left: 0;
            right: 0;
            bottom: ${() => `${footerHeight}px`};
            height: 1px;
            background-color: ${({ theme }) => theme.neutralPalette.gray_4};
        }
    `,
    ReadonlyFormColumn: styled.div<{ $height: number }>`
        flex: 1;

        form {
            display: flex;
            flex-direction: column;
            gap: 24px 0;
            padding: 20px 24px 24px;
            overflow-y: auto;
            height: ${({ $height }) => `${$height - footerHeight}px`};
        }
    `,
    GeneratedNoteColumn: styled.div<{ $height: number }>`
        flex: 1;

        form {
            position: relative;
            display: flex;
            flex-direction: column;

            & > *:last-child {
                border-top: 0;
                margin: 0;
                padding: 12px 24px;
            }

            &:before {
                content: '';
                display: block;
                position: absolute;
                left: 0;
                top: 0;
                bottom: ${() => `${footerHeight}px`};
                width: 1px;
                background-color: ${({ theme }) => theme.neutralPalette.gray_4};
            }
        }

        .form__content {
            overflow-y: auto;
            padding: 20px 24px 24px;
            height: ${({ $height }) => `${$height - footerHeight}px`};
        }
    `,
    Button: styled(Button)`
        padding: 0;
    `,
};

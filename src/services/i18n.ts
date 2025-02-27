import { i18n } from '@lingui/core';
import type { Locale } from 'antd/es/locale';
import enAntdLocale from 'antd/es/locale/en_US';
import esAntdLocale from 'antd/es/locale/es_ES';
import { en, es } from 'make-plural/plurals';

import { messages as enMessages } from 'src/locale/en/messages';
import { messages as esMessages } from 'src/locale/es/messages';

export type LocaleCode = 'en' | 'es';

const localMap = {
    en: enMessages,
    es: esMessages,
};

export const locales = {
    en: 'English',
    es: 'Español',
};

i18n.loadLocaleData({
    en: { plurals: en },
    es: { plurals: es },
});

export const getCurrentLocale = () => {
    return (localStorage.getItem('locale') || 'en') as LocaleCode;
};

export const setCurrentLocale = (locale: string) => {
    localStorage.setItem('locale', locale);
};

export function dynamicActivate(locale: LocaleCode) {
    const messages = localMap[locale];
    if (messages) {
        i18n.load(locale, messages);
    }

    i18n.activate(locale);
}

export const antdLocaleMap: { [localeCode in LocaleCode]: Locale } = {
    en: enAntdLocale,
    es: esAntdLocale,
    ru: ruAntdLocale,
};

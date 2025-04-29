import { i18n } from '@lingui/core';
import { en, es } from 'make-plural/plurals';

import { messages as enMessagesEmr } from 'src/locale-frontend/en/messages';
import { messages as esMessagesEmr } from 'src/locale-frontend/es/messages';

import { messages as enMessages } from 'src/locale-frontend/en/messages';
import { messages as esMessages } from 'src/locale-frontend/es/messages';

type locale = 'en' | 'es';

// Merge messages: local messages take priority, but fallback to EMR messages
const mergedEnMessages = { ...enMessagesEmr, ...enMessages };
const mergedEsMessages = { ...esMessagesEmr, ...esMessages };

const localMap = {
    en: mergedEnMessages,
    es: mergedEsMessages,
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
    return (localStorage.getItem('locale') || 'en') as locale;
};

export const setCurrentLocale = (locale: string) => {
    localStorage.setItem('locale', locale);
};

export function dynamicActivate(locale: locale) {
    const messages = localMap[locale];

    if (messages) {
        i18n.load(locale, messages);
    }
    i18n.activate(locale);
}

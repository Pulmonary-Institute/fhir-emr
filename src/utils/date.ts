import { Period } from 'fhir/r4b';
import _ from 'lodash';

import { parseFHIRDate, parseFHIRDateTime } from '@beda.software/fhir-react';

export const humanDate = 'DD MMM YYYY';
export const humanDateYearMonth = 'MMM YYYY';
export const humanTime = 'HH:mm';
export const humanDateTime = 'DD MMM YYYY HH:mm';

export const formatHumanDateTime = (date?: string) => {
    if (!date) {
        return '';
    }
    return parseFHIRDate(date).format(humanDate);
};

export const formatHumanDate = (date?: string) => {
    if (!date) {
        return '';
    }

    // Year only 2000
    if (date.length === 4) {
        return date;
    }

    // Year and month 2000-01
    if (date.length === 7) {
        return parseFHIRDate(date + '-01').format(humanDateYearMonth);
    }

    if (date.length === 10) {
        return parseFHIRDate(date).format(humanDate);
    }

    return parseFHIRDateTime(date).format(humanDate);
};

export function formatPeriodDateTime(period?: Period) {
    const timeRange = _.compact([
        period?.start ? parseFHIRDateTime(period.start).format('HH:mm') : undefined,
        period?.end ? parseFHIRDateTime(period.end).format('HH:mm') : undefined,
    ]).join('–');

    return period?.start ? `${formatHumanDate(period.start)} ${timeRange}` : null;
}

import { getPalette } from './palette';

export * from '@beda.software/emr/dist/theme/antd-theme';
export * from './ThemeProvider';

export function getAppTheme({ dark }: { dark?: boolean }) {
    const palette = getPalette({ dark });

    return palette;
}

import { theme as ANTDTheme, ThemeConfig } from 'antd';
import _ from 'lodash';

import { colors, getPalette } from './palette';

const { getDesignToken } = ANTDTheme;

export function getANTDTheme({ dark }: { dark?: boolean }): ThemeConfig {
    const palette = getPalette({ dark });

    const config: ThemeConfig = {
        token: {
            colorPrimary: colors.primary,
            colorLink: palette.link,
            colorLinkHover: palette.primaryPalette.bcp_5,
            colorLinkActive: palette.primaryPalette.bcp_7,
            colorError: palette.error,
            colorSuccess: palette.success,
            colorWarning: palette.warning,
            colorInfo: palette.primaryPalette.bcp_6,
            fontFamily: `'DM Sans', serif`,
        },
        algorithm: dark ? ANTDTheme.darkAlgorithm : ANTDTheme.defaultAlgorithm,
        components: {
            Typography: {
                titleMarginBottom: 0,
                titleMarginTop: 0,
            },
            Layout: {
                colorBgHeader: palette.neutral.sidebarBackground,
                colorBgBody: palette.neutralPalette.gray_2,
            },
            Result: {
                colorSuccess: palette.secondary,
            },
        },
    };

    const defaultTokens = getDesignToken(config);

    return _.merge({}, { token: defaultTokens }, config);
}

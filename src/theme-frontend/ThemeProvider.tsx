import { ConfigProvider as ANTDConfigProvider } from 'antd';
import { ReactNode } from 'react';
import { ThemeProvider as StyledComponentsThemeProvider, createGlobalStyle } from 'styled-components';

import { getAppTheme, getANTDTheme } from './';

interface Props {
    theme?: 'dark' | 'light';
    children: ReactNode;
}

const GlobalStyle = createGlobalStyle<{ $whiteColor?: boolean }>`
  :root {
    --theme-icon-primary: ${({ theme }) => theme.iconColors.primary};
    --theme-icon-secondary: ${({ theme }) => theme.iconColors.secondary};
    --theme-sidebar-background: ${({ theme }) => theme.neutral.sidebarBackground};
  }

  body {
    background-color: ${({ theme }) => theme.antdTheme?.colorBgBase};
  }
`;

export function ThemeProvider(props: Props) {
    const { theme: initialTheme = 'light', children } = props;

    const isDark = false;

    const antdTheme = getANTDTheme({ dark: isDark });
    const appTheme = {
        ...getAppTheme({ dark: isDark }),
        mode: initialTheme,
        antdTheme: antdTheme.token,
    };

    return (
        <ANTDConfigProvider theme={antdTheme}>
            <StyledComponentsThemeProvider theme={appTheme}>
                <GlobalStyle />
                {children}
            </StyledComponentsThemeProvider>
        </ANTDConfigProvider>
    );
}

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

import '../../fhir-emr/dist/services/initialize';
import 'antd/dist/reset.css';
import '../dist/style.css';

import { App } from '../../fhir-emr/dist/containers';
import { ValueSetExpandProvider } from '../../fhir-emr/dist/contexts';
import { BottomMenuLayout } from '../dist/components/BaseLayout/Sidebar/SidebarBottom/context';
import { MenuLayout } from '../dist/components/BaseLayout/Sidebar/SidebarTop/context';
import { PatientDashboardProvider } from '../dist/components/Dashboard/contexts';

import { dashboardConfig } from '../src/containers/PatientDetails-frontEnd/Dashboard/config';
import { bottomMenuLayout, menuLayout } from '../src/menu';
import { anonymousRoutes, authenticatedRoutes } from '../src/routes';
import { dynamicActivate, getCurrentLocale } from '../src/services-frontend/i18n';
import { populateUserInfoSharedState } from '../src/services-frontend/role';
import { expandEMRValueSet } from '../src/services-frontend/valueset-expand';
import { ThemeProvider } from '../src/theme-frontend';

const AppWithContext = () => {
  useEffect(() => {
    dynamicActivate(getCurrentLocale());
  }, []);

  return (
    <I18nProvider i18n={i18n}>
      <PatientDashboardProvider dashboard={dashboardConfig}>
        <ValueSetExpandProvider.Provider value={expandEMRValueSet}>
          <MenuLayout.Provider value={menuLayout}>
            <BottomMenuLayout.Provider value={bottomMenuLayout}>
              <ThemeProvider>
                <App
                  authenticatedRoutes={authenticatedRoutes}
                  anonymousRoutes={anonymousRoutes}
                  populateUserInfoSharedState={populateUserInfoSharedState}
                />
              </ThemeProvider>
            </BottomMenuLayout.Provider>
          </MenuLayout.Provider>
        </ValueSetExpandProvider.Provider>
      </PatientDashboardProvider>
    </I18nProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
      <AppWithContext />
  </React.StrictMode>,
);


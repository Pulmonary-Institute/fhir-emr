import type { Dashboard, DashboardInstance } from '@beda.software/emr/dist/components/Dashboard/types';

import { CareTeamWidget } from './CareTeamWidget';
import { CurrentAdmissionWidget } from './CurrentAdmissionWidget';
import { DiagnosesWidget } from './DiagnosesWidget';
import { GeneralInformationWidget } from './GeneralInformationWidget';
import { InsuranceWidget } from './InsuranceWidget';

const patientDashboardConfig: DashboardInstance = {
    top: [
        {
            widget: GeneralInformationWidget,
        },
        {
            widget: CurrentAdmissionWidget,
        },
    ],
    left: [
        {
            widget: CareTeamWidget,
        },
        {
            widget: InsuranceWidget,
        },
    ],
    right: [
        {
            widget: DiagnosesWidget,
        },
    ],
    bottom: [],
};

export const dashboardConfig: Dashboard = {
    default: patientDashboardConfig,
};

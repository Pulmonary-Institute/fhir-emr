import { Route } from 'react-router-dom';

import { Census } from './containers/Census';
import { CensusReport } from './containers/CensusReport';
import { InsurancesList } from './containers/Insurances';
import { FacilityList } from './containers/FacilityList';
import HomeAdmin from './containers/Home/AdminNew';
import HomeCensus from './containers/Home/Census';
import HomeProvider from './containers/Home/Provider';
import HomeScribe from './containers/Home/Scriber';
import { PatientDetails } from './containers/PatientDetails-frontEnd';
import { PatientList } from './containers/PatientList';
import { PractitionerList } from './containers/PractitionerList';
import ReportAdmin from './containers/Reports';
import { Scribe } from './containers/Scribe';
import { PromptsList } from './containers/Prompts';

export const authenticatedRoutes = (
    <>
        <Route path="/facilities" element={<FacilityList />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/practitioners" element={<PractitionerList />} />
        <Route path="/patients/:id/*" element={<PatientDetails />} />
        <Route path="/census" element={<Census />} />
        <Route path="/census-report" element={<CensusReport />} />
        <Route path="/insurances" element={<InsurancesList />} />
        <Route path="/prompts" element={<PromptsList />} />
        <Route path="/scribe" element={<Scribe />} />
        <Route path="/home-admin" element={<HomeAdmin />} />
        <Route path="/home-census" element={<HomeCensus />} />
        <Route path="/home-scriber" element={<HomeScribe />} />
        <Route path="/report-admin" element={<ReportAdmin />} />
        <Route path="/billing" element={<Scribe />} />
        {/* Practitioner */}
        <Route path="/home-provider" element={<HomeProvider />} />
    </>
);

export const anonymousRoutes = <></>;

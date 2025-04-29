import { PageContainer} from '@beda.software/emr/components';
import { Trans } from '@lingui/macro';
import MonthlyNotesScribe from '../components/MonthlySumaryScribe/index';
import FacilitySummary from '../components/FacilitySumaryScriber';
import '../style-admin-dashboard.css'
function HomeScribe() {

  return (<>
    <PageContainer title={<Trans>Welcome Scriber</Trans>}>
      <div className="home-scriber">
        <MonthlyNotesScribe />
        <FacilitySummary/>
      </div>
    </PageContainer>
  </>)
}
export default HomeScribe
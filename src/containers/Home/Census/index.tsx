import { Trans } from '@lingui/macro';
import { PageContainer } from '@beda.software/emr/components';
import FacilitySummary from '../components/FacilitySumary';
function HomeCensus() {
  return (<>

    <PageContainer title={<Trans>Wlcome Census Team</Trans>}>
        <FacilitySummary />
    </PageContainer>
  </>
  )
}
export default HomeCensus  
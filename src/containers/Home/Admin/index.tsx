import { Trans } from '@lingui/macro';
import { PageContainer } from '@beda.software/emr/components';
import Notice from '../components/News/PreviewLinks';
import MonthlySumary from '../components/MonthlySumaryAdmin';
import Notifications from '../components/Notifications';
import Invoice from '../components/Invoices';
function HomeAdmin() {
    return (
        <>
            <PageContainer title={<Trans>Welcome Administrator</Trans>}></PageContainer>

            <div className="home">
                <div className="column column1">
                    <div className="rectangulo1">
                        <Notice />
                        <Invoice />
                    </div>
                    <div className="containerDown">
                        <div className="rectangulo2"></div>
                        <div className="rectangulo3">
                            <MonthlySumary />
                        </div>
                    </div>
                </div>
                <div className="column column2">
                    <div className="rectangulo4">
                        <Notifications />
                    </div>
                </div>
            </div>
        </>
    );
}
export default HomeAdmin;

import { t } from '@lingui/macro';

function PendingCensus() {
    return (
        <>
            <div className="containerInvoice">
                <h5>{t`Pending Census`}</h5>
                <ul className="listGroup">
                    <li className="list">
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">Boca Circle</div>
                            10-11-2024
                        </div>
                        <div className="badge">12</div>
                    </li>
                    <li className="list">
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">Fountain Manor</div>
                            10-12-2024
                        </div>
                        <div className="badge">12</div>
                    </li>
                    <li className="list">
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">South Dade</div>
                            10-12-2024
                        </div>
                        <div className="badge">15</div>
                    </li>
                </ul>
            </div>
        </>
    );
}
export default PendingCensus;

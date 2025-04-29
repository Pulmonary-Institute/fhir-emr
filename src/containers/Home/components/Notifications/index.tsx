import { t } from '@lingui/macro';

function Notifications() {
    return (
        <>
            <div className="notifications">
                <h5 style={{ marginLeft: '20px' }}>{t`Notifications`}</h5>
                <ul className="listGroup-notifications">
                    <li className="list-notifications">
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">Census Team: Boca Facility 10-23-24</div>
                            18 March, 2023 | 09:00 PM
                        </div>
                        <div className="badge">View</div>
                    </li>
                    <li className="list-notifications">
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">Census Team: South Facility 10-23-24</div>
                            18 March, 2023 | 09:00 PM
                        </div>
                        <div className="badge">View</div>
                    </li>
                    <li className="list-notifications">
                        <div className="ms-2 me-auto">
                            <div className="fw-bold">Scribe: Completed Encounters Boca 10-22-24</div>
                            18 March, 2023 | 09:00 PM
                        </div>
                        <div className="badge">{t`View`}</div>
                    </li>
                </ul>
            </div>
        </>
    );
}
export default Notifications;

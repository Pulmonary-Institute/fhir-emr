import { useState, useEffect } from 'react';
import { t } from '@lingui/macro';
import { getAllInvoices } from './hooks';

function Invoice() {
    const [billinSumary, setBillinSumary] = useState([{}]);

    useEffect(() => {
        loadInvoice();
    }, []);

    //get all invoice
    const loadInvoice = async () => {
        const data = await getAllInvoices();
        const result = countStatuses(data);
        setBillinSumary(result);
    };

    //Count billin status
    function countStatuses(data: any) {
        const statusCount = data.reduce((acc: any, item: any) => {
            acc[item.status] = (acc[item.status] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(statusCount).map(([status, count]) => ({
            status,
            count,
        }));
    }

    //put first letter Upper
    const capitalizeFirstLetter = (word: string) => {
        if (!word) return ''; // Manejar el caso de una cadena vacía o indefinida
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };
    return (
        <>
            <div className="containerInvoice">
                <h5>{t`Billing Summary`}</h5>
                <ul className="listGroup">
                    {billinSumary.map((item: any) => (
                        <li className="list">
                            <div className="fw-bold">{capitalizeFirstLetter(item.status)}</div>
                            <div className="badge">{item.count}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
export default Invoice;

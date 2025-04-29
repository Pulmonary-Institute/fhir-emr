function Census() {
    return (<>
        <div className='containerInvoice'>
            <h5>Census</h5>
            <div className="overflow-auto" style={{ maxHeight: "220px", width: '100%', borderRadius: '6px' }}>
            <ul className="listGroup">
                <li className="list">
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">Dr. Ferrer &gt; Boca Circle</div>
                        10-11-2024
                    </div>
                    <div className="badge">Create</div>
                </li>
                <li className="list">
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">Dr. Nestor &gt; Fountain Manor</div>
                        10-12-2024
                    </div>
                    <div className="badge">Create</div>
                </li>
                <li className="list">
                    <div className="ms-2 me-auto">
                        <div className="fw-bold">Dr. Alfonso &gt; South Dade</div>
                        10-12-2024
                    </div>
                    <div className="badge">Create</div>
                </li>
            </ul>
            </div>
        </div>
    </>)
}
export default Census
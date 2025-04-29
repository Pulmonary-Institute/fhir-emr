import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';
import 'bootstrap/dist/css/bootstrap.min.css';
import NewBroadcastModal from './Components/ModalAddURL';
import { saveBroadcast, getAllBroadcast, deleteBroadcast } from './hooks';

function Notice() {
    const [previewData, setPreviewData] = useState<any>(null);
    const [broadcast, setBroadcast] = useState([]);
    const [url, setUrl] = useState('');
    const [isOpenModalNewBroadcast, setIsOpenModalBroadcast] = useState(false);
    const [rol, setRol] = useState('');
    useEffect(() => {
        loadData();
        InfoUser();
    }, []);

    //get User Info
    const InfoUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/auth/userinfo', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                console.error('Error', response.statusText);
                return;
            }
            const data = await response.json();
            console.log(data.role[0].name);
            setRol(data.role[0].name);
        } catch (error) {
            console.log(error);
        }
    };

    //
    const fetchPreviewData = async () => {
        const response = await fetch(`https://api.linkpreview.net`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'f1178141ff5bcd2b9f382b82f58af3f8', q: url }),
        });
        const data = await response.json();
        setPreviewData(data);
    };
    //get all broadcasts
    const loadData = async () => {
        const data = await getAllBroadcast();
        setBroadcast(data);
    };

    //
    const handleOpenModalNewBroadcast = () => {
        setIsOpenModalBroadcast(true);
    };
    //
    const handleCloseModal = () => {
        setIsOpenModalBroadcast(false);
    };

    const handleSaveNewBroadcast = async () => {
        handleCloseModal();
        await fetchPreviewData();
        setUrl('');
    };
    const handleSendBroadcast = async () => {
        await saveBroadcast(previewData);
        loadData();
        setPreviewData(null);
    };
    const handleDeleteBroadcast = async (id: String) => {
        console.log(id);
        await deleteBroadcast(id);
        setBroadcast((prevItems: any) => prevItems.filter((item: any) => item.id !== id));
    };

    return (
        <>
            <div className="containerBroadcast">
                {rol === 'admin' ? (
                    <button
                        type="button"
                        onClick={handleOpenModalNewBroadcast}
                        className="btn btn-primary"
                        style={{ marginTop: '5%', backgroundColor: '#6194FA' }}
                    >
                        {t`New Broadcast`}
                    </button>
                ) : (
                    <h5>{t`Daily Read`}</h5>
                )}

                {broadcast && !previewData && (
                    <div
                        className="overflow-auto"
                        style={{ maxHeight: '220px', width: '100%', borderRadius: '6px', marginTop: '8%' }}
                    >
                        {broadcast.map((item: any) => (
                            <div
                                style={{ width: '100%', borderRadius: '10px', maxWidth: '400px', textAlign: 'center' }}
                            >
                                {rol === 'admin' && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteBroadcast(item.id)}
                                        className="btn-close"
                                        aria-label="Close"
                                    ></button>
                                )}
                                <img
                                    style={{ width: '200px', height: '140px', borderRadius: '10px' }}
                                    src={item.image}
                                    alt={item.title}
                                />
                                <h6>{item.title}</h6>
                                <p style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                    {item.description}
                                </p>
                                <a href={item.url} target="_blank" rel="noopener noreferrer">
                                    {t`Read More`}
                                </a>
                            </div>
                        ))}
                    </div>
                )}

                <NewBroadcastModal
                    isOpenModal={isOpenModalNewBroadcast}
                    handleCloseModal={handleCloseModal}
                    handleSaveNewBroadcast={handleSaveNewBroadcast}
                    setUrl={setUrl}
                    url={url}
                />
                {previewData && (
                    <div
                        style={{
                            width: '100%',
                            borderRadius: '8px',
                            maxWidth: '400px',
                            textAlign: 'center',
                            marginTop: '10px',
                        }}
                    >
                        <img
                            style={{ width: '200px', height: '100px', borderRadius: '10px' }}
                            src={previewData.image}
                            alt={previewData.title}
                        />
                        <p>{previewData.title}</p>
                        <button type="button" onClick={handleSendBroadcast} className="btn btn-primary">
                            {t`Send`}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
export default Notice;

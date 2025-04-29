import { Modal, Button, Form } from 'react-bootstrap';
import { t } from '@lingui/macro';

interface NewBroadcastModalProps {
    isOpenModal: boolean;
    handleCloseModal: () => void;
    handleSaveNewBroadcast: () => void;
    setUrl: (url: string) => void;
    url: string;
}
function NewBroadcastModal({
    isOpenModal,
    handleCloseModal,
    handleSaveNewBroadcast,
    setUrl,
    url,
}: NewBroadcastModalProps) {
    return (
        <>
            <Modal show={isOpenModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{t`Add News`}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>URL</Form.Label>
                            <Form.Control
                                type="text"
                                name="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="Enter the URL"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        {t`Cancel`}
                    </Button>
                    <Button variant="primary" onClick={handleSaveNewBroadcast}>
                        {t`Add`}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
export default NewBroadcastModal;

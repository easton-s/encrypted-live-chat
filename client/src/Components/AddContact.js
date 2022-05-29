import { useEffect, useState } from 'react';
import { useDispatch, connect } from 'react-redux';

import { setContactModal, addContact as setContactState } from '../store/actions';

import styles from '../styles/Modal.module.css';

const AddContact = ({ open })=>{
    const dispatch = useDispatch();

    const [openModal, setOpenModal] = useState(open);

    useEffect(()=>setOpenModal(open), [open]);

    const [contact, setContact] = useState({ username: '', publicKey: '' });

    const closeModal = ()=>{
        dispatch(setContactModal({ open: false }));
    };

    const addContact = async ()=>{
        await dispatch(setContactState(contact));

        setContact({ username: '', publicKey: '' });
        closeModal();
    };

    return (
        <div className={styles.container} style={{
            display: openModal ? 'block' : 'none'
        }}>
            <div className={styles.modal} style={{ width: '500px' }}>
                <div className={styles.modalHeader}>
                    <h1>Add New Contact</h1>
                    <button onClick={closeModal}>X</button>
                </div>
                <div className={styles.modalBody}>
                    <div className={styles.textboxContainer}>
                        <div className={styles.fieldContainer} style={{width: '100%', marginRight: '-0px'}}>
                            <div className={styles.fieldLabels}>
                                <h3>Public Key</h3>
                            </div>
                            <textarea value={contact.publicKey || ''} onChange={e => setContact(old => ({ ...old, publicKey: e.target.value }))}></textarea>
                        </div>          
                    </div>

                    <div className={styles.inputContainer}>
                        <div className={styles.fieldContainer}>
                            <div className={styles.fieldLabels}>
                                <h3>Contact Username</h3>
                            </div>

                            <input type="text" value={contact.username || ''} onChange={e => setContact(old => ({ ...old, username: e.target.value }))}/>
                        </div>

                        <button className={styles.button} onClick={()=>addContact()}>Add Contact</button>
                    </div>
                </div>
            </div>

            <div className={styles.overlay} onClick={closeModal}/>
        </div>
    );
};

const mapStateToProps = state => ({
    open: state.contactModal.open,
});

export default connect(mapStateToProps)(AddContact);
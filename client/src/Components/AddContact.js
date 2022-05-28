import { useEffect, useState } from 'react';

import {encryptMessage} from '../utils/pgp.util';

import styles from '../styles/Modal.module.css';

const AddContact = ({ open, setOpen, socket, publicKey, toast, setChat })=>{
    const [openModal, setOpenModal] = useState(open);

    useEffect(()=>setOpenModal(open), [open]);

    const [contact, setContact] = useState({ username: '', publicKey: '' });

    const closeModal = ()=>{
        setOpen({ open: false });
    };

    const modifyChat = (username, publicKey)=>{
        console.log(username, publicKey);

        setChat(chat => ({
            ...chat,
            [username]: {
                publicKey: publicKey,
                messages: [],
            }
        }));
    };

    const addContact = async ()=>{
        if(!contact.publicKey || contact.publicKey.length < 1){
            return toast.error('Please enter a public key.');
        }
        if(!contact.username || contact.username.length < 1){
            return toast.error('Please enter a username.');
        }

        console.log(contact);

        let encryptedMessage = await encryptMessage(publicKey, 'Connecting chat...');
        console.log(encryptedMessage);

        socket.emit('send_message', { recievingPublicKey: contact.publicKey, message: encryptedMessage }, (err, data)=>{
            if(err){
                if(err === 4) toast.error('User is not connected to the server.');
                return;
            }
            console.log(data);
            modifyChat(contact.username, contact.publicKey);

            setContact({ username: '', publicKey: '' });
            setOpen({ open: false });
            toast.success('Contact successfully added.');
        });
    }

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

export default AddContact;
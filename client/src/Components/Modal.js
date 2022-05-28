import { useEffect, useState } from 'react';

import {generateKeypair} from '../utils/pgp.util';

import styles from '../styles/Modal.module.css';

const Modal = ({ open, setOpen, generateNew, setParentKeys, toast })=>{
    const [openModal, setOpenModal] = useState(open);

    const [keypair, setKeypair] = useState({ publicKey: null, privateKey: null, passphrase: null, username: null, save: false });

    useEffect(()=>{
        setOpenModal(open);
        
        if(open && !generateNew){
            let keyData = JSON.parse(localStorage.getItem('keypair'));
            if(keyData){
                setKeypair({ ...keyData, save: true });
                toast.info('Keypair found in browser local storage.');
            }
        }
    }, [open]);

    const [generateForm, setGenerateForm] = useState({
        passphrase: '',
        username: '',
        save: false,
    });

    /*
    on generation:
    set passphrase, username, choose to save to localstorage

    on load:
    2 large text boxes for pub and priv, choose to save to localstorage

    figure out how to get userids from keypair
    */
    // generate new keypair
    const generate = async ()=>{
        if(!generateForm.passphrase || generateForm.passphrase.length < 1){
            return toast.error('Please enter a passphrase.');
        }
        if(!generateForm.username || generateForm.username.length < 1){
            return toast.error('Please enter a username.');
        }

        let { privateKey, publicKey, passphrase, username } = await generateKeypair(generateForm);

        setParentKeys({ privateKey, publicKey, passphrase, username });

        setOpen({ open: false });
        toast.success('Keypair successfully loaded.');
    };

    // load existing keypair
    const load = ()=>{
        setParentKeys({ privateKey: keypair.privateKey, publicKey: keypair.publicKey, passphrase: keypair.passphrase, username: keypair.username });

        setOpen({ open: false });
        toast.success('Keypair successfully loaded.');
    };

    const generatePassphrase = ()=>{
        let result = '' ;
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789%^&*()_+-=[]{}|;:,./<>?~1234567890';
        let charactersLength = characters.length;
        for (let i = 0; i < 24; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        setGenerateForm(old => ({
            ...old,
            passphrase: result
        }));
    }

    const closeModal = ()=>{
        setOpen({ open: false });
    };

    return (
        <div className={styles.container} style={{
            display: openModal ? 'block' : 'none'
        }}>
            <div className={styles.modal} style={{
                width: generateNew ? '600px' : '800px'
            }}>
                <div className={styles.modalHeader}>
                    <h1>{generateNew ? 'Generate New Keypair' : 'Load Existing Keypair'}</h1>
                    <button onClick={closeModal}>X</button>
                </div>
                <div className={styles.modalBody}>
                    {generateNew ? (
                        <>
                            <div className={styles.inputContainer}>
                                <div className={styles.fieldContainer}>
                                    <div className={styles.fieldLabels}>
                                        <h3>Passphrase</h3>
                                        <span onClick={generatePassphrase}>Generate Passphrase</span>
                                    </div>

                                    <input type="text" value={generateForm.passphrase || ''} onChange={e => setGenerateForm(old => ({ ...old, passphrase: e.target.value }))}/>
                                </div>

                                <div className={styles.fieldContainer}>
                                    <div className={styles.fieldLabels}>
                                        <h3>Username</h3>
                                    </div>

                                    <input type="text" value={generateForm.username || ''} onChange={e => setGenerateForm(old => ({ ...old, username: e.target.value }))}/>
                                </div>

                                <label>Save to browser LocalStorage?</label>
                                <input className={styles.checkBox} type="checkbox" checked={generateForm.save} onChange={e => setGenerateForm(old => ({ ...old, save: !generateForm.save }))}/>

                                <button className={styles.button} onClick={generate}>Generate Keypair</button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.textboxContainer}>
                                <div className={styles.fieldContainer} style={{width: '100%'}}>
                                    <div className={styles.fieldLabels}>
                                        <h3>Public Key</h3>
                                    </div>
                                    <textarea value={keypair.publicKey || ''} onChange={e => setKeypair(old => ({ ...old, publicKey: e.target.value }))}></textarea>
                                </div>

                                <div className={styles.fieldContainer} style={{width: '100%'}}>
                                    <div className={styles.fieldLabels}>
                                        <h3>Private Key</h3>
                                    </div>
                                    <textarea value={keypair.privateKey || ''} onChange={e => setKeypair(old => ({ ...old, privateKey: e.target.value }))}></textarea>
                                </div>            
                            </div>

                            <div className={styles.inputContainer}>
                                <div className={styles.fieldContainer}>
                                    <div className={styles.fieldLabels}>
                                        <h3>Username</h3>
                                    </div>

                                    <input type="text" value={keypair.username || ''} onChange={e => setKeypair(old => ({ ...old, username: e.target.value }))}/>
                                </div>

                                <div className={styles.fieldContainer}>
                                    <div className={styles.fieldLabels}>
                                        <h3>Private Key Passphrase</h3>
                                    </div>

                                    <input type="text" value={keypair.passphrase || ''} onChange={e => setKeypair(old => ({ ...old, passphrase: e.target.value }))}/>
                                </div>

                                <label>Save to browser LocalStorage?</label>
                                <input className={styles.checkBox} type="checkbox" checked={keypair.save} onChange={e => setKeypair(old => ({ ...old, save: !keypair.save }))}/>

                                <button className={styles.button} onClick={load}>Load</button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.overlay} onClick={closeModal}/>
        </div>
    )
};

export default Modal;
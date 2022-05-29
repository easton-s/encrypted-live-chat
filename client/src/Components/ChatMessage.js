import { useState, useEffect } from 'react';
import { connect } from "react-redux";

import { decryptMessage } from '../utils/pgp.util';

import styles from '../styles/ChatMessage.module.css';

const ChatMessage = ({ username, message, keypair })=>{
    const [plaintextMessage, setPlaintextMessage] = useState('');

    const setDecryptedMessage = async ()=>{
        let decrypted = await decryptMessage(keypair.privateKey, keypair.passphrase, message.message);
        setPlaintextMessage(decrypted);
    };

    useEffect(()=>{
        setDecryptedMessage();
    }, []);

    return (
        <div className={styles.chatMessage}>
            <span>{message.mine ? 'Me' : username}</span>
            <p>{plaintextMessage}</p>
        </div>
    )
};

const mapStateToProps = (state, { username, message })=>({
    username,
    message,
    keypair: state.keypair,
});

export default connect(mapStateToProps)(ChatMessage);
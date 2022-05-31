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
        <div className={styles.container} style={{
            alignItems: message.mine ? 'flex-end' : 'flex-start',
        }}>
            {
                plaintextMessage === '==ADD_CONTACT==' ?
                (
                    <div className={styles.connectingMessage}>
                        <span>You are now connected with {username}</span>
                    </div>
                ) : (
                    <div className={styles.chatMessage} style={{
                        alignItems: message.mine ? 'flex-end' : 'flex-start',
                    }}>
                        <span>{message.mine ? 'Me' : username}</span>
                        <p style={{
                            backgroundColor: message.mine ? '#0070f3' : '#7e7e7e',
                        }}>{plaintextMessage}</p>
                        <span>{new Date(message.timestamp).toLocaleDateString() + ' ' + new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                )
            }
        </div>
    )
};

const mapStateToProps = (state, { username, message })=>({
    username,
    message,
    keypair: state.keypair,
});

export default connect(mapStateToProps)(ChatMessage);
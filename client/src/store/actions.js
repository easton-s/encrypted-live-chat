import {encryptMessage} from '../utils/pgp.util';

export const setSocket = (socket) => (dispatch) => {
    return dispatch({
        type: "SET_SOCKET",
        payload: socket,
    });
};

export const setKeypair = (keypair) => (dispatch, getState) => {
    if(keypair && typeof keypair === 'object'){
        const { socket, toast } = getState();

        socket.emit('authenticate', { publicKey: keypair.publicKey }, (err, success)=>{
          if(err){
            if(err === 1) toast.error('Someone is already authenticated with this public key. Please close any other sessions and try again.');
            return dispatch({ type: "SET_KEYPAIR", payload: null });
          }
          
          toast.success('Successfully authenticated to websocket server.');
          return dispatch({ type: "SET_KEYPAIR", payload: keypair });
        });
    }

    return dispatch({ type: "SET_KEYPAIR", payload: null });
};

export const setModal = (state) => (dispatch) => {
    return dispatch({
        type: "SET_MODAL",
        payload: state,
    });
};

export const setContactModal = (state) => (dispatch) => {
    return dispatch({
        type: "SET_CONTACT_MODAL",
        payload: state,
    });
};

export const addContact = (contact) => async (dispatch, getState) => {
    const {socket, toast} = getState();

    if(!contact.publicKey || contact.publicKey.length < 1){
        return toast.error('Please enter a public key.');
    }
    if(!contact.username || contact.username.length < 1){
        return toast.error('Please enter a username.');
    }
    
    let encryptedMessage = await encryptMessage(contact.publicKey, 'Connecting chat...');

    socket.emit('send_message', { recievingPublicKey: contact.publicKey, message: encryptedMessage }, (err, data)=>{
        if(err){
            if(err === 4) toast.error('User is not connected to the server.');
            return;
        }
        toast.success('Contact successfully added.');

        return dispatch({ type: "ADD_CONTACT", payload: contact });
    });
};

export const sendMessage = ({ username, message }) => async (dispatch, getState) => {
    if(!message || message.length < 1) return;

    const {socket, toast, chat} = getState();

    let contact = chat[username];
    let encryptedMessage = await encryptMessage(contact.publicKey, message);

    socket.emit('send_message', { recievingPublicKey: contact.publicKey, message: encryptedMessage }, (err, data)=>{
        if(err){
            if(err === 4) return toast.error('User is not connected to the server.');
            return toast.error('Error sending message.');
        }

        return dispatch({ type: "ADD_MESSAGE", payload: { username, message: { ...data, mine: true }}});
    });
};

export const receivedMessage = (message) => async (dispatch, getState)=>{
    const { chat } = getState();

    //find the username of the sender based on publickey
    let senderUsername = Object.keys(chat).find(x => JSON.stringify(chat[x].from) === message.publicKey);
    console.log(senderUsername);
    //if the receiver doesnt have the sender in their contact list, add them
    if(!senderUsername || senderUsername === undefined){
        senderUsername = 'NEW CONTACT';

        await dispatch({ type: "ADD_CONTACT", payload: { 
            username: senderUsername,
            publicKey: message.publicKey,
        }});
    }

    //const { chat: chat2 } = getState();

    console.log(senderUsername);

    return dispatch({ type: "ADD_MESSAGE", payload: { 
        username: senderUsername, 
        message: message
    }});
};
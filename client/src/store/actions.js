import {encryptMessage, decryptMessage} from '../utils/pgp.util';

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

export const addContact = ({ username, publicKey }) => async (dispatch, getState) => {
    const {socket, toast, chat, keypair} = getState();

    if(!publicKey || publicKey.length < 1){
        return toast.error('Please enter a public key.');
    }
    if(!username || username.length < 1){
        return toast.error('Please enter a username.');
    }
    if(chat[username]){
        return toast.error('You have already added a contact with this username.');
    }
    
    let encryptedMessage = await encryptMessage(publicKey, '==ADD_CONTACT==');
    let localEncrypedMessage = await encryptMessage(keypair.publicKey,  '==ADD_CONTACT==');

    socket.emit('send_message', { recievingPublicKey: publicKey, message: encryptedMessage }, async (err, data)=>{
        if(err){
            if(err === 4) toast.error('User is not connected to the server.');
            return;
        }
        toast.success('Contact successfully added.');

        await dispatch({ type: "ADD_CONTACT", payload: { username, publicKey } });

        return dispatch({ type: "ADD_MESSAGE", payload: { 
            username: username, 
            message: {...data, message: localEncrypedMessage}
        }});
    });
};

export const editContact = ({ username, publicKey, oldUsername, oldPublicKey }) => async (dispatch, getState) => {
    const {toast, chat} = getState();

    if(!publicKey || publicKey.length < 1){
        return toast.error('Please enter a public key.');
    }
    if(!username || username.length < 1){
        return toast.error('Please enter a username.');
    }
    if(username === oldUsername && publicKey === oldPublicKey){
        return;
    }
    if(chat[username]){
        return toast.error('You have already added a contact with this username.');
    }

    return dispatch({ type: "EDIT_CONTACT", payload: { username, publicKey, oldUsername, oldPublicKey } });
};

export const sendMessage = ({ username, message }) => async (dispatch, getState) => {
    if(!message || message.length < 1) return;

    const {socket, toast, chat, keypair} = getState();

    let contact = chat[username];
    let encryptedMessage = await encryptMessage(contact.publicKey, message);
    let localEncrypedMessage = await encryptMessage(keypair.publicKey, message);

    socket.emit('send_message', { recievingPublicKey: contact.publicKey, message: encryptedMessage }, (err, data)=>{
        if(err){
            if(err === 4) return toast.error('User is not connected to the server.');
            return toast.error('Error sending message.');
        }

        return dispatch({ type: "ADD_MESSAGE", payload: { username, message: { ...data, message: localEncrypedMessage, mine: true }}});
    });
};

export const receivedMessage = (message) => async (dispatch, getState)=>{
    const { chat } = getState();
    //find the username of the sender based on publickey
    let senderUsername = Object.keys(chat).find(x => chat[x].publicKey === message.from);

    //if the receiver doesnt have the sender in their contact list, add them
    if(!senderUsername || senderUsername === undefined){
        let amountOfNewContacts = Object.keys(chat).filter(x => x.includes('NEW CONTACT'))?.length || 0;
        senderUsername = `NEW CONTACT #${amountOfNewContacts + 1}`;

        await dispatch({ type: "ADD_CONTACT", payload: { 
            username: senderUsername,
            publicKey: message.from,
        }});
    }

    return dispatch({ type: "ADD_MESSAGE", payload: { 
        username: senderUsername, 
        message: message
    }});
};

export const txtChatExport = (username) => async (dispatch, getState)=>{
    const { chat, keypair } = getState();

    let contact = chat[username];

    let txtToExport = '';

    for(const message of contact.messages){
        let decryptedMessage = await decryptMessage(keypair.privateKey, keypair.passphrase, message.message);

        let formattedDate = `${new Date(message.timestamp).toLocaleDateString()} ${new Date(message.timestamp).toLocaleTimeString()}`;

        txtToExport += `${message.mine ? 'Me' : username}\n${decryptedMessage}\n${formattedDate}\n\n`;
    }

    const element = document.createElement("a");

    const file = new Blob([txtToExport], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);

    element.download = `${username}_CHAT_EXPORT_${Date.now()}.txt`;
    document.body.appendChild(element);

    element.click();
};

export const dataImport = (data) => async (dispatch, getState)=>{
    const { toast } = getState();

    try{
        let parsedData = JSON.parse(data);

        for(const key of Object.keys(parsedData)){
            if(!parsedData[key].publicKey || !parsedData[key].messages){
                delete parsedData[key];
            }
        }

        if(Object.keys(parsedData).length < 1){
            return toast.error('No valid data found.');
        }

        return dispatch({ type: "SET_CHAT", payload: parsedData });
    } catch(err){
        toast.error('Invalid JSON data.');
    }
};
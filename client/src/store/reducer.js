import io from 'socket.io-client';
import { toast } from 'react-toastify';

const STATE_TEMPLATE = {
    socket: io('http://localhost:8080'),
    toast: toast,
    keypair: null,
    chat: {},
    modal: { open: false, type: false },
    contactModal: { open: false },
};

const reducer = (state = STATE_TEMPLATE, action)=>{
    switch(action.type){
        case 'SET_SOCKET':
            return {
                ...state,
                socket: action.payload
            }

        case 'SET_MODAL':
            return {
                ...state,
                modal: action.payload
            }
        
        case 'SET_CONTACT_MODAL':
            return {
                ...state,
                contactModal: action.payload
            }
            
        case 'SET_KEYPAIR':
            return {
                ...state,
                keypair: action.payload
            }

        case 'ADD_CONTACT':
            return {
                ...state,
                chat: {
                    ...state.chat,
                    [action.payload.username]: {
                        publicKey: action.payload.publicKey,
                        messages: [],
                    }
                },
            }

        case 'ADD_MESSAGE':
            return {
                ...state,
                chat: {
                    ...state.chat,
                    [action.payload.username || 'NEW CONTACT']: {
                        ...state.chat[action.payload.username || 'NEW CONTACT'],
                        messages: [
                            ...state.chat[action.payload.username || 'NEW CONTACT'].messages,
                            action.payload.message
                        ]
                    }
                },
            }
        
        default:
            return state;
    }
}

export default reducer;
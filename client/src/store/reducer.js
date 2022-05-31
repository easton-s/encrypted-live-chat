import { toast } from 'react-toastify';
import io from 'socket.io-client';

const STATE_TEMPLATE = {
    socket: io('http://localhost:8080'),
    toast: toast,
    keypair: null,
    chat: {},
    modal: { open: false, type: false },
    contactModal: { open: false, edit: false, oldDetails: {} },
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

        case 'SET_CHAT':
            return {
                ...state,
                chat: action.payload
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

        case 'EDIT_CONTACT':
            let newChat = {
                ...state.chat,
                [action.payload.username]: {
                    ...state.chat[action.payload.oldUsername],
                    publicKey: action.payload.publicKey,
                }
            };
            delete newChat[action.payload.oldUsername];

            return {
                ...state,
                chat: newChat,
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
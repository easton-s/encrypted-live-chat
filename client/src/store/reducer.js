const reducer = (state = {}, action)=>{
    switch(action.type){
        case 'SET_SOCKET':
            return {
                ...state,
                socket: action.payload
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
                    [action.payload.username]: {
                        ...state.chat[action.payload.username],
                        messages: [
                            ...state.chat[action.payload.username].messages,
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
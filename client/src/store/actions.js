export const setSocket = (socket) => {
    return {
        type: "SET_SOCKET",
        payload: socket,
    };
};

export const setKeypair = (keypair) => {
    return {
        type: "SET_KEYPAIR",
        payload: keypair,
    };
};
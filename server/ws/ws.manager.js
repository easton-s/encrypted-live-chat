const { authenticate, sendMessage, disconnect } = require('./ws.methods');

module.exports = (socket)=>{
    //register user session to db
    socket.on('authenticate', (data, callback)=>authenticate(socket, data, callback));

    //send message to user
    socket.on('send_message', (data, callback)=>sendMessage(socket, data, callback));

    //when user disconnects
    socket.on("disconnect", ()=>disconnect(socket));
};
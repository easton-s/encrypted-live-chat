const User = require('../db/Users.modal');

const authenticate = async (socket, {publicKey}, callback)=>{
    if(!callback || typeof callback !== 'function') return;
    //dont allow duplicate sockets
    let existing = await User.findOne({publicKey: JSON.stringify(publicKey)});
    if(existing){
        return callback(1);
    }

    //create new user object in db
    await new User({
        publicKey: JSON.stringify(publicKey),
        socketId: socket.id
    }).save();

    socket.publicKey = publicKey;

    return callback(null, true);
};

const sendMessage = async (socket, {recievingPublicKey, message}, callback)=>{
    if(!callback || typeof callback !== 'function') return;
    if(!socket.publicKey) return callback(1);
    if(!recievingPublicKey) return callback(2);
    if(!message) return callback(3);

    //find user
    let user = await User.findOne({publicKey: JSON.stringify(recievingPublicKey)});
    if(!user){
        return callback(4);
    }

    let messageObj = {
        from: socket.publicKey,
        message: message,
        timestamp: Date.now()
    };

    //send message to user
    socket.to(user.socketId).emit('message', messageObj);

    return callback(null, messageObj);
};

const disconnect = async (socket)=>{
    //remove user from db
    let existing = await User.findOne({socketId: socket.id});
    if(existing){ 
        await User.findOneAndRemove({socketId: socket.id});
    }
};

module.exports = {
    authenticate,
    sendMessage,
    disconnect
}
const http = require('http'),
express = require('express'),
path = require('path'),
mongoose = require('mongoose'),
socketRoutes = require('./ws/ws.manager');

//db connection
mongoose.connect(`mongodb://127.0.0.1:27017/private-chat`, { useNewUrlParser: true, useUnifiedTopology: true });

//setup web server
const app = express();
const server = http.createServer(app);
server.listen(process.env.PORT || 8080, () => console.log('[!] HTTP Web server is online.'));

//startup socketio stuff
const io = require('socket.io')(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

io.on('connection', socketRoutes);

app.use(express.static(path.join(__dirname, '../app/build')));

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname, '../app/build/index.html'));
});
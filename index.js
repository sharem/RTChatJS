require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const express = require("express");
const app = express();
const port = process.env.PORT || 3700;

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan('dev'));

app.set('views', __dirname + '/tpl');
app.set('view engine', "pug");
app.engine('pug', require('pug').__express);
app.get("/", function(req, res){
    res.render("page");
});

app.use(express.static(__dirname + '/public'));


const io = require('socket.io').listen(app.listen(port));

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
});

console.log("Listening on port " + port);

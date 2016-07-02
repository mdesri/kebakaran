var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);
var notifyPath = "/notify/";
var count = 1;
//var jsonSubs;
//var contentInstanceList;
var connections;
server.listen(3000);
//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', routes);

///// some helper methods to decode contentInstance data //////
function parseB64Json(s) {
    //console.log('yayayayaya');
    return JSON.parse(new Buffer(s, 'base64').toString('utf8'));
}


app.post(notifyPath, function (req, res) {
    //console.log('body: ' + JSON.stringify(req.body));
    console.log('[' + count + ']');
    var jsonSubs = parseB64Json(req.body.notify.representation.$t)
    var contentInstanceList = jsonSubs.contentInstanceCollection.contentInstance;
    console.log('list: ' + contentInstanceList);
    var indexlenList = contentInstanceList.length - 1;
    var obj = (parseB64Json(contentInstanceList[indexlenList].content.$t));
    var timestamp = getDateTime();
    var suhu = obk.suhu;
    connections.emit('data', { suhu : suhu, timestamp : timestamp });
    res.send(req.body);
    
    count++;
});

function getDateTime() {
    
    var date = new Date();
    
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    
    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    
    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    
    var year = date.getFullYear();
    
    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;
    
    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;
    
    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;
 
}

io.on('connection', function (socket) {
    connections = socket;
});

// ERROR HANDLING
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
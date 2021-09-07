var winston = require('winston');
var config = require('config');
var RollingFile = require('another-rolling-file-transport');

var logLevel = config.get("Service.log.level");
var logFile = config.get("Service.log.file");
var logConsole = config.get("Service.log.console");

var logger = new winston.Logger();
logger.handleExceptions(new winston.transports.File({ filename: logFile, json: false }));
if (logConsole)
    logger.add(winston.transports.Console, { level: logLevel });
logger.add(winston.transports.RollingFile, { filename: logFile, level: logLevel, timestamp: true, maxFiles: 10, json: false });

var io = require('socket.io')(config.get("Service.port"), { allowEIO3: true });

io.on('connection', function (socket) {
    logger.info('Received new socket.io connection: ', socket.id);

    socket.on('event', function (msg, callback) {
	if (callback)
	    callback('acknowledgement');
        logger.verbose('Received msg ', msg, ' from ', socket.id);
        socket.emit('event', 'Echo: ' + msg);
    });

    socket.on('disconnect', function () {
        logger.info('Disconnected: ', socket.id);
    });
});

var engine = require('engine.io');
var server = engine.listen(Number(config.get("Service.port")) + 1);

server.on('connection', function (socket) {
    logger.info('Received new engine.io connection: ', socket.id);
    socket.on('message', function (msg) {
        logger.verbose('Received msg ', msg, ' from ', socket.id);
        socket.send('Echo: ' + msg);
    });

    socket.on('close', function () {
        logger.info('Disconnected: ', socket.id);
    });
});

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

var io = require('socket.io')(config.get("Service.port"));

io.on('connection', function (socket) {
    logger.info('Received new connection: ', socket.id);

    socket.on('message', function (msg) {
        logger.verbose('Received msg ', msg, ' from ', socket.id);
        socket.emit('event', 'Echo: ' + msg);
    });

    socket.on('disconnect', function () {
        logger.info('Disconnected: ', socket.id)
        socket.emit('user disconnected');
    });
});

const winston = require('winston');
const config = require('config');
require('winston-daily-rotate-file');

const logLevel = config.get("Service.log.level");
const logFile = config.get("Service.log.file");
const logConsole = config.get("Service.log.console");

const transports = [ new winston.transports.DailyRotateFile({ filename: logFile, maxFiles: '10d', maxSize: '20m' }) ];
if (logConsole)
    transports.push(new winston.transports.Console({ level: logLevel }));
const logger = winston.createLogger({
    transports,
    exceptionHandlers: [
        new winston.transports.File({ filename: logFile })
    ]
});

const io = require('socket.io')(config.get("Service.port"), { allowEIO3: true });

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

const engine = require('engine.io');
const httpServer = require('http').createServer().listen(Number(config.get("Service.port")) + 1);
const server = new engine.Server();

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

httpServer.on('upgrade', (req, socket, head) => {
    server.handleUpgrade(req, socket, head);
});

httpServer.on('request', (req, res) => {
    if (req.url === '/') {
        res.end('OK');
    } else {
        server.handleRequest(req, res);
    }
});

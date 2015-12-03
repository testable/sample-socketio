var socket = require('socket.io-client')('http://dev.testable.io:5811');
socket.on('connect', function(){
	console.log('connected');
	socket.emit('message', 'This is a test');
});	
socket.on('event', function(data){
	console.log(data);
});
socket.on('disconnect', function(){
	console.log('disconnected');
});

var socket = require('socket.io-client')('http://localhost:5811');
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
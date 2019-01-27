
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var mongo = require('mongodb').MongoClient;

server.listen(4005);
console.log('Server up and running on port 4005');


// two arrays formed
users = [];
connections =[];

app.get('/',function(req,res){
	res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

// Connect to Mongodb
mongo.connect('mongodb://127.0.0.1/task26-12-18',function(err,db){
	if(err){throw err;}
console.log('Mongodb Connected');

io.sockets.on('connection',function(socket){

	var chat = db.collection('chats');

// SEE IN HTML FILE AS WELL
	// sendStatus =function(s){
	// 	socket.emit('status',s);
	// }

	
	socket.on('stream',function(image){
		socket.broadcast.emit('stream',image);
	});

	connections.push(socket);
	console.log('connected');

	chat.find().limit(100).sort({_id:1}).toArray(function(err,res){
		if(err){throw err;}
		socket.emit('output',res);
	});

	socket.on('disconnect',function(data){
		if(!socket.username) return;
		users.splice(users.indexOf(socket.username),1);
		updateUsernames();
		connections.splice(connections.indexOf(socket),1);
		console.log('disconnected');
	});

	socket.on('send message', function(data){
		chat.insert({msg:data,user:socket.username},function(){
			io.sockets.emit('new message',{msg:data, user:socket.username});
		});
	});
	
	socket.on('new user', function(data,callback){
		callback(true);
		console.log(data);
		socket.username = data;
		console.log(socket.username);
		users.push(socket.username);
		updateUsernames();
	});



	function updateUsernames(){
		console.log('updates?');
		io.sockets.emit('get users',users);
	}
});
});
// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/getScreenId
var express = require('express');
var app = express();
// var port = process.env.PORT || 9001;

// var server = require('http'),
//     url = require('url'),
//     path = require('path'),
//     fs = require('fs');

// function serverHandler(request, response) {
//     try {
//         var uri = url.parse(request.url).pathname,
//             filename = path.join(process.cwd(), uri);

//         if (filename && filename.search(/server.js/g) !== -1) {
//             response.writeHead(404, {
//                 'Content-Type': 'text/plain'
//             });
//             response.write('404 Not Found: ' + path.join('/', uri) + '\n');
//             response.end();
//             return;
//         }

//         var stats;

//         try {
//             stats = fs.lstatSync(filename);
//         } catch (e) {
//             response.writeHead(404, {
//                 'Content-Type': 'text/plain'
//             });
//             response.write('404 Not Found: ' + path.join('/', uri) + '\n');
//             response.end();
//             return;
//         }

//         if (fs.statSync(filename).isDirectory()) {
//             response.writeHead(404, {
//                 'Content-Type': 'text/html'
//             });

//             filename += '/index.html';
//         }


//         fs.readFile(filename, 'utf8', function(err, file) {
//             if (err) {
//                 response.writeHead(500, {
//                     'Content-Type': 'text/plain'
//                 });
//                 response.write('404 Not Found: ' + path.join('/', uri) + '\n');
//                 response.end();
//                 return;
//             }

//             response.writeHead(200);
//             response.write(file, 'utf8');
//             response.end();
//         });
//     } catch (e) {
//         response.writeHead(404, {
//             'Content-Type': 'text/plain'
//         });
//         response.write('<h1>Unexpected error:</h1><br><br>' + e.stack || e.message || JSON.stringify(e));
//         response.end();
//     }
// }

// var app = server.createServer(serverHandler);

// function runServer() {
//     app = app.listen(port, process.env.IP || '0.0.0.0', function() {
//         var addr = app.address();

//         if (addr.address === '0.0.0.0') {
//             addr.address = 'localhost';
//         }

//         console.log('Server listening at http://' + addr.address + ':' + addr.port);
//     });
// }

// runServer();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var mongo = require('mongodb').MongoClient;

server.listen(4000);
console.log('Server up and running on port 4000');


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
// var db = client.db('');
io.sockets.on('connection',function(socket){
    // console.log('user connected');
    // socket.on('chat message',function(msg){
    //     console.log(msg);
    //     io.emit('chat message',msg);
	// });
	var chat = db.collection('chats');

// SEE IN HTML FILE AS WELL
	// sendStatus =function(s){
	// 	socket.emit('status',s);
	// }

	

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
		console.log(data);
		chat.insert({msg:data,user:socket.username},function(){
			io.sockets.emit('new message',{msg:data, user:socket.username});
		});
	});
	
	socket.on('new user', function(data,callback){
		// callback();
		callback(data);
		console.log(data);
		socket.username = data;
		console.log('wbt');
		io.sockets.emit('new user',socket.username);
		console.log(socket.username);
		users.push(socket.username);
		updateUsernames();
	});

	socket.on('stream',function(image){
		socket.broadcast.emit('stream',image);
	});


	function updateUsernames(){
		console.log('updates?');
		io.sockets.emit('get users',users);
	}
});
});
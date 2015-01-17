var static = require('node-static');
var fs = require('fs');
var util = require('util');
var app = require('./app.js');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json();
//
// Create a node-static server instance to serve the './public' folder
//
var file = new static.Server('./public');

var middler = require('middler')
    , server = require('http').createServer()

// to attach a single handler to the server:
middler(server, function (req, res, next) {
    console.info(req.method, req.url);
    next();
});

// calling middler(server) again will access the same middleware chain:
middler(server)
    .get('/api/runTests/',function(req,res){
        try{
            app.run();
        }
        catch(e){
            console.log('Error: ',e);
        }
        res.writeHead(200);
        res.end();
    })

    .get('/api/test/:filename',function(req,res){
        res.writeHead(200,{'Content-Type':'application/json'});
        var data = app.runTest(req.params.filename);

        res.write(JSON.stringify(data));
        res.end();
    })

    .get('/api/getParams/',function(req,res){
        res.writeHead(200,{'Content-type':'application/json'});
        res.write(JSON.stringify(app.params));
        res.end();
    })
    .post('/api/setParams/',jsonParser,function(req,res){
        var prefix = '/api/setParams/';
        res.writeHead(200);
        app.setParams(req.body);
        res.end();
    })
    // since this handler is added last, it will run last:
    .add(function (req, res, next) {
        file.serve(req, res);
    });


var port = 8080;
server.listen(port);

console.info('listening on port',port);
//create a websocket
var WebSocketServer = require('websocket').server;
var connection;

function sendLog(data){
    if(connection){
        connection.sendUTF(util.format.apply(null,data));
    }
}

var wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    connection = request.accept('log-protocol', request.origin);
    console.log((new Date()) + ' Session Started. \nMay the odds be ever in your favor.');

    connection.on('close', function(reasonCode, description) {
        console.info('%s Peer %s disconnected.',(new Date()), connection.remoteAddress);
    });

    //    connection.on('message', function(message) {});
});


orig_console_log = console.log;

console.log = function(){
    sendLog(arguments);
    orig_console_log.apply(console, arguments);
}


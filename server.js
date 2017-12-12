//ESEMPIO COMPLETO -> https://medium.com/@martin.sikora/node-js-websocket-simple-chat-tutorial-2def3a841b61

//require (installare librerie necessarie)
var WebSocketServer = require('websocket').server;
var http = require('http');
var fs = require('fs');

//porta d'ascolto
var port = 8080;

//lista di utenti connessi. Quando uno si disconnette lo metto a 'void' per poi riempire il buco alla prima connessione
var clients = [ ];

//creo il server HTTP, quando viene chiamato risponde con test
var server = http.createServer(function(request, response) {
  fs.readFile('./test.html', //n.b. path relativo, devo avviare il server da dentro la cartella
  function (err, data) {
    if (err) {
      response.writeHead(500);
      return response.end('Error loading test.html');
    }
    response.writeHead(200);
    response.end(data);
  });
});
//Il server HTTP attende sulla porta 8080
server.listen(port, function() { });

//Creo il server WS
wsServer = new WebSocketServer({
  httpServer: server
});

//Configuro funzioni del server WS
wsServer.on('request', function(request) {
  //Creo una nuova 'connection' per ogni richiesta ricevuta
  var connection = request.accept(null, request.origin);
  var index;
  var full = true;
  for(var i=0; i<clients.length && full; i++){
      if(clients[i]=='void'){
          index = i;
          clients[i] = connection;
          full = false;
      }
  }
  if(full) index = clients.push(connection) - 1;
  console.log('utente '+index+' connesso');

  //Cosa faccio quando ricevo un messaggio
  connection.on('message', function(message) {
      if (message.type == 'utf8'){
        for (var i=0; i < clients.length; i++) { 
            if(i!=index && clients[i]!='void') clients[i].send(message.utf8Data);
        }
        console.log('message received from client ' + index + ': ' + message.utf8Data);
      }
  });

  //Cosa faccio quando si disconnette un client
  connection.on('close', function(connection) {
    clients.splice(index, 1, 'void'); //rimuovo dalla lista
    console.log('utente '+index+' disconnesso');
  });
});
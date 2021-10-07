const express = require("express");
const os = require("os");
const http = require("http");
const socketio = require("socket.io");


// App setup
const app = express();
const server = http.createServer(app);

const io = socketio(server);

let wt = "Web-Terminal";
var clients = [];


// website setup
app.use(express.static("./public"));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})


// declaration of local functions
function getSidFromId(client)
{
    // clients - global list of connected clients
    let sid;
    
    clients.forEach(entry => {
        if (entry.name == client)
        {
            sid = entry.id;
        }
    });
    
    console.log(`getSidFromId -> ${sid}`);
    return sid;
}


// declaration of socket events
io.on("connection", (socket) => {
    // Triggers when a client connects to the server.
    //
    let name;
    let currentDir;

    socket.on('clear-terminal', () => {
        // Sends the event clear-terminal 
        //
        let sid = getSidFromId(wt);
        socket.to(sid).emit('clear-terminal');
        console.log(wt + ' -> Clearing commandline output');
    });
    
    socket.on('disconnect', () => {
        // removing user from clients list
        //
        console.log(clients);
        let i = 0;

        clients.forEach(entry => {
            if (entry.name == name)
            {
                clients.splice(i);
            }
            i = i + 1;
        });

        console.log('Client ' + name + ' disconnected\n');
        io.emit('new-message', `Client '${name}' just disconnected`);
    });

    io.on("exit", () => {
        console.log("Exiting");
    });


    socket.on('get-clients', () => {
        // Returns a list of currently connected clients
        console.log(clients);

        let sid = getSidFromId(wt);
        for (let i = 0; i < clients.length; i++)
        {
            if (clients[i].name == wt)  // skips second registration message
                continue;

            io.emit('new-message', `${clients[i].name} established a connection # ${clients[i].id}`);
        }

        io.to(sid).emit('refresh-clients', clients);
    });
    

    socket.on('register', (deviceName, platform) =>
    {
        // Checks for other instances, adds them to the server registry
        // and requests a refresh on the Web-Terminal.

        name = deviceName;
        clients.push({ name: name, id: socket.id, os: platform});

        let sid = getSidFromId('Web-Terminal');
        io.to(sid).emit('refresh-clients', clients);

        console.log(`${name} established a connection # ${socket.id}\n`);
        io.emit('new-message', `${name} established a connection # ${socket.id}\n`);
    });    
    

    socket.on('new-message', (message) => {
        // Broadcasts a log message to every conncected client
        message = `[ ${name} ] : ` + message;
        console.log(message);

        io.emit('new-message', message);
    });
    

    socket.on('send-command', (data) => {
        let target = data.client;
        let command = data.cmd;
        
        let sid = getSidFromId(target);    
        if (sid == null)
        {
            // client does not exist in swarm
            socket.emit("new-message", currentDir + ": '" + target + "' is not connected to the swarm.");
        }

        socket.to(sid).emit("send-command", {cwd: currentDir, id: sid, cmd: command});      
    });


    socket.on('set-cwd', (path) =>
    {
        currentDir = path;
    });
});

server.listen(3000, () => {
    console.log('Server listening on http://127.0.0.1:3000/');
});
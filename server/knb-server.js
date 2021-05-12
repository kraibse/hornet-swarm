const express = require("express");
const http = require("http");
const socketio = require("socket.io");


// App setup
const app = express();
const server = http.createServer(app);

const io = socketio(server);

// Static files
app.use(express.static("./public"));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})


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


var clients = [];

io.on("connection", (socket) => {
    let name;
    let currentDir;

    // first login
    socket.on('register', (deviceName) =>
    {
        name = deviceName;
        clients.push({ name : name, id: socket.id });

        console.log(`${name} established a connection # ${socket.id}\n`);
        io.emit('new-message', `---${name} joined the chat---`);
    });


    socket.on('set-cwd', (path) =>
    {
        currentDir = path;
    });

  
    socket.on('new-message', (message) => {
        message = `${name}: ` + message

        console.log(message);
        socket.broadcast.emit('new-message', message);
    });
  

    socket.on('send-command', (data) => {
        let target = data.client;
        let command = data.cmd;

        let sid = getSidFromId(target);    
        if (sid == null)
        {
            // client does not exist in swarm
            socket.emit("new-message", currentDir + ": '" + target + "' is not connected to the swarm.");
        };

        let serverName = "Web-Terminal";

        socket.to(sid).emit("send-command", {cwd: currentDir, client: serverName, cmd: command});
    });


    //  { working }
    socket.on('disconnect', () => {

        // removing user from clients list
        let i = 0;
        clients.forEach(entry => {
            if (entry.name == name)
            {
                clients.splice(i);
            }
            i = i + 1;
        });

        console.log('User ' + name + ' disconnected\n');
        io.emit('new-message', `---${name} left the chat---`);
    });

    io.on("exit", () => {
        console.log("Exiting");
    });
});

server.listen(3000, () => {
    console.log('Server listening on http://127.0.0.1:3000/');
});
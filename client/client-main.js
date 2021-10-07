const https = require('https')
const io = require("socket.io-client");
const os = require("os");

const { exec } = require("child_process");


let url = "http://192.168.178.";
let ip = 64;
let port = 3000;


const socket = io(url + ip + ":" + port, {
    reconnectionDelayMax: 10000,
    auth: {
        token: "123"
    },
    query: {
        "000": "---"
    }
});

socket.on("connect", () => {
    socket.emit("register", os.hostname(), os.platform());
});

socket.on("new-message", (msg) => {
    console.log(msg);
});

socket.on("exec-command", (data) => {
    // connection coming through directly
    
    let sid = data.id;
    let cwd = "~/client/";
    let command = data.cmd.trim();
    
    let message = `${cwd}$ ` + command;
    console.log("Incoming command -> " + command);
    
    if (command == null || command == "")
        return;

    // Start of custom commands
    console.log(os.platform());
    if (command == "clear" || command == "cls")
    {
        socket.emit('clear-terminal');    // triggered on webterminal
        socket.to(sid).emit('new-message', cwd + "$ " + command);
    }
  
    
    const cmd = exec(command, (error, stdout, stderr) => {
        if (error)
        {
            console.log(error.stack);
            console.log("Error code: " + error.code);
            console.log("Signal received: " + error.signal);
        }
        socket.emit("new-message", (message));
        socket.emit("new-message", (stdout));
        socket.emit("new-message", (stderr))
        console.log(stdout);
    });
});
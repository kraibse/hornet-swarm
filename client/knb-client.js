const https = require('https')
const io = require("socket.io-client");
const os = require("os");

const { exec } = require("child_process");

let currentDir;


// pwd
function setCurrentDirVariable()
{
    const cmd = exec("pwd", (error, stdout, stderr) => {
        socket.emit("set-cwd", stdout);
    });
}


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
    setCurrentDirVariable();
    socket.emit("register", os.hostname());
});

socket.on("new-message", (msg) => {
    console.log(msg);
});


socket.on("pwd", () => {
    setCurrentDirVariable();
}); 

socket.on("send-command", (data) => {
    // connection coming through directly
    
    let client = data.client;
    let cwd = __dirname;
    let command = data.cmd.trim();
    
    let message = `${cwd}$ ` + command;
    console.log("Incoming command -> " + message);
    
    // socket.emit('new-message', command);
    if (command == "clear")
    {
        socket.emit('clear-terminal');    // triggered on webterminal
        socket.emit('new-message', cwd + "$ ");
        // return;
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
        console.log(stdout);
    });
});
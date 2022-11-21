// --- NODE MOUDLES ---
const http = require('http');
const ws = require('ws')
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const os = require('os');
const { exec } = require("child_process");
const PORT = process.env.PORT || "3000"

// --- VARIABILES ---
const user = os.userInfo().username;
const terminal_name = os.hostname();





// ---- EXPRESS SERVER ----
app.set("view engine", "ejs"); 


app.use(express.static('public'))


app.enable("trust proxy"); 


app.use(bodyParser.urlencoded({ extended: false })); 


app.get("/", (req, res) => { 
    res.render("index", {user:'' +user +'',term_name:'' +terminal_name +''}) 
}); 


app.get("/favicon.png", (req, res) => { 
    res.sendFile(__dirname + "/favicon.png") 
}); 

app.get("/favicon.ico", (req, res) => { 
    res.sendFile(__dirname + "/favicon.png") 
}); 


app.get("/404", (req, res) => { 
   res.render(`${__dirname}/views/404`);
}); 

app.get("/*", (req, res) => { 
   res.redirect("/404");
}); 

// This workaround has been found at https://cmsdk.com/javascript/failed-to-decode-param-in-express.html
app.use(function(err, req, res, next) { // Helps with Failed to decode problem.
    res.redirect('/404');
    next(err); 
});





// ----------- WEBSOCKET SERVER -------------

// we need to create our own http server so express and ws can share it.
const server = http.createServer(app);
// pass the created server to ws
const wss = new ws.Server({ server });

//let sockets = new Set();

// based on https://www.npmjs.com/package/ws#simple-server
wss.on('connection', function connection(ws, req) {

  const ip = req.socket.remoteAddress

  ws.on('message', (message, isBinary) => {
    const result = isBinary ? message : message.toString() 
    const data = JSON.parse(result)
    
   // console.log(`Client ${ip} - Received: ${result}`);
    
    if(data["event"] === "connected") { 
      return ws.send({ "event": "hello" } ) 
    }
    
    if(data["event"] === "ping") {
      return ws.send({ "event": "pong" } ) 
    };
    
    if(data["event"] === "command") {
      //console.log(data["args"]); 
      //return ws.send(JSON.stringify ( [ { "event": "consoleoutput", "args": data["args"] } ] ) )
      return runprogram(data["args"], ws)
    };
    
    
});
 
ws.on('close', function () {

console.log(`Websocket - A client has disconnected! - client IP Address ${ip}`)
    
});

  
console.log(`Websocket - A client has connected! - client IP Address: ${ip}`)


});




// --------- FUNCTIONS: --------

async function runprogram(program, ws) {
  
exec(`${program}`, (error, stdout, stderr) => {

if(stderr) {
 ws.send(JSON.stringify ( [ { "event": "consoleoutput", "args": stderr } ] ) )
}
  
if(stdout) {
 console.log(stdout)
 ws.send(JSON.stringify ( [ { "event": "consoleoutput", "args": stdout } ] ) )
}
  
if(error) {
 console.log(error)
 //ws.send(JSON.stringify ( [ { "event": "consoleoutput", "args": `Error: ${error.code} - cmd: ${error.cmd}` } ] ) )
}
  
});
  
}




const listener = server.listen(PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

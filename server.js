// --- NODE MOUDLES ---
const express = require("express");
const bodyParser = require("body-parser"); 
const app = express();
const { exec } = require("child_process");


// --- VARIABILES ---
const user = "app";
const terminal_name = "nicsena-terminal-BETA";


// ---- EXPRESS SERVER ----
app.set("view engine", "ejs"); 

app.set("views", __dirname + "/"); 

app.use(bodyParser.urlencoded({ extended: false })); 

app.get("/", (req, res) => { 
      const IP = req.headers["x-forwarded-for"].split(",")[0];
    console.log("Got Request - The IP Address is: " +IP + ""); // logs the ip in server console
    res.render("index", {user:'' +user +'',term_name:'' +terminal_name +''}) 
}); 

app.get("/welcome", (req, res) => { 
res.render("welcome")
}); 


app.get("/help", (req, res) => { 
res.render("help")
}); 



app.get("/output", (req, res) => { 

    const IP = req.headers["x-forwarded-for"].split(",")[0];
    console.log("[OUTPUT] Got Request - The IP Address is: " +IP + " - URL: " +req.url +""); // logs the ip in server console
  
if (req.url.toLowerCase() === "/output?program=whoami" || req.url.toLowerCase() === "/output?program=about" || req.url.toLowerCase() === "/output?program=pwd" || req.url.toLowerCase() === "/output?program=blank"  || req.url.toLowerCase().startsWith("/output?program=ls") ) { //WHOAMI

  if (req.url.toLowerCase() === "/output?program=about" || req.url.toLowerCase() === "/output?program=blank") {
    exec("./programs/" +req.query.program +".sh", (error, stdout, stderr) => {
    res.render("output", {output:'' +stdout +'\\', program:'' +req.query.program + ''})
    console.log("[OUTPUT] Ran the program: " +req.query.program + '.sh and output is: ' +stdout + ' ')
      
    });
  
    } else {
      
    exec("" +req.query.program + "", (error, stdout, stderr) => {
    res.render("output", {output:'' +stdout +'\\', program:'' +req.query.program + ''})
    console.log("[OUTPUT] Ran the program: " +req.query.program + ' and output is: ' +stdout + ' ')
      
    })};
  
  } else {
    
  if(req.query.program === "help" || req.query.program === "cmds") {//HELP COMMAND
    res.render("help")
  
  } else {
    res.render("errors/output_not_found", {command:'' +req.query.program +''})

  }}}); 




app.get("/favicon.png", (req, res) => { 
    res.sendFile(__dirname + "/favicon.png") 
}); 



//Error Pages
app.get("*", (req, res) => { //This is here just in case.
    const IP = req.headers["x-forwarded-for"].split(",")[0];
    console.log(IP); // logs the ip in server console
    res.render("errors/404"); //This page is in htdocs/Errors/
}); 

// This workaround has been found at https://cmsdk.com/javascript/failed-to-decode-param-in-express.html
app.use(function(err, req, res, next) { // Helps with Failed to decode problem.
    res.redirect('/errors/404');
    next(err); 
  });


const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

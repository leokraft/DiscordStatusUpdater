var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var readline = require('readline');

function login(email, password) {
   
   var xhr = new XMLHttpRequest();

   var authUrl = "https://discord.com/api/v9/auth/login";
   xhr.open("POST", authUrl);
   xhr.setRequestHeader("Content-Type", "application/json");

   loginData ={login:email, password:password}
   xhr.send(JSON.stringify(loginData));

   xhr.onreadystatechange = function () { //answer = {token: ""}
      if (xhr.readyState === 4) {
         console.log(xhr.status);
         console.log(xhr.responseText);

         if (xhr.status == 200) {
            var jsonResponse = JSON.parse(xhr.responseText);
            process.env["DISCORD_TOKEN"] = jsonResponse["token"]
            afterLogin()
         }

         if (xhr.status == 400) {
            console.log("Login failed, try again.") // FIXME: what about CAPTCHA
            getCredentials()
         }
      }
   };
}

function getCredentials() {

   // new Interface to handle console in-/output
   var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true
   });
    
   rl.stdoutMuted = false;

   rl._writeToOutput = function _writeToOutput(stringToWrite) {
      if (rl.stdoutMuted && stringToWrite != '\r\n') {
         writeLen = stringToWrite.length
         if (writeLen > 1) {
            rl.output.write(query + "*".repeat(writeLen - query.length));
         } else {
            rl.output.write("*");
         }
      } else {
         rl.output.write(stringToWrite);
      }
   };

   var query = 'Email: '
   rl.question(query, function(email) {
      query = 'Password: '
      rl.question(query, function(password) {
         rl.close();
         login(email, password)
      });
      rl.stdoutMuted = true;
   });
}


function setStatus(newStatus) {
   
   var xhr = new XMLHttpRequest();

   var url = "https://discord.com/api/v9/users/@me/settings";
   xhr.open("PATCH", url);

   xhr.setRequestHeader("Content-Type", "application/json");
   xhr.setRequestHeader("authorization", process.env["DISCORD_TOKEN"]);

   xhr.onreadystatechange = function () {
      // just prints status and response when request is done
      if (xhr.readyState === 4) {
         console.log(xhr.status);
         console.log(xhr.responseText);

         if (xhr.status == 400) {
            console.log("Token invalid.")
            console.log("Please login.")
            getCredentials()
         }
      }
   };

   var data = {status: newStatus};
   xhr.send(JSON.stringify(data));
}

function afterLogin() {
   newStatus = "online" // "dnd", "idle", "invisible"
   setStatus(newStatus)
}

if (!("DISCORD_TOKEN" in process.env)) {
   getCredentials()

} else {
   afterLogin()
}
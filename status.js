var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var readline = require('readline');
const yargs = require('yargs');

var logToken = false;

function setDiscordToken(token) {
   process.env["DISCORD_TOKEN"] = token;
   console.log("Token successfully set.");

   if (logToken) {
      console.log("Token: ", token);
   }
}

async function promptMFA() {
   return new Promise(function (resolve, reject) {
      
      var rl = readline.createInterface({
         input: process.stdin,
         output: process.stdout,
         terminal: true
      });

      rl.question('Auth code: ', function(authCode) {
         rl.close();
         resolve(authCode);
      });
   });
};

async function handleMFA(ticket, authCode) {

   var xhr = new XMLHttpRequest();

   const authUrl = "https://discord.com/api/v9/auth/mfa/totp";

   xhr.open("POST", authUrl);
   xhr.setRequestHeader("Content-Type", "application/json");

   authData = {code: authCode, ticket: ticket}

   return new Promise(function (resolve, reject) {
      xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
            if (xhr.status == 200) {
               console.log("MFA successful.");
               var jsonResponse = JSON.parse(xhr.responseText);
               setDiscordToken(jsonResponse["token"]);
               resolve(true)
            }

            if (xhr.status == 400) {
               console.log("Invalid authentication code.");
               resolve(false)
            }
         }
      }

      xhr.send(JSON.stringify(authData));
   })
}

function checkForMFA(returnCode) {

   if (returnCode == 1) {
      return true;
   }

   return false;
}

async function login(email, password) {
   return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();

      const authUrl = "https://discord.com/api/v9/auth/login";
      xhr.open("POST", authUrl);
      xhr.setRequestHeader("Content-Type", "application/json");

      loginData ={login:email, password:password}

      xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
            if (xhr.status == 200) {
               var jsonResponse = JSON.parse(xhr.responseText);

               if ("mfa" in jsonResponse && jsonResponse["mfa"] == true) {
                  console.log("MFA required to login.");
                  resolve({success: true, mfa: true, ticket: jsonResponse["ticket"]})
                  
                  
               } else {
                  console.log("Login successful.");
                  setDiscordToken(jsonResponse["token"]);
                  resolve({success: true, mfa: false, ticket: null});
               }
            }

            if (xhr.status == 400) {
               console.log("Login failed, try again.");
               reject({success: false, mfa: false, ticket: null});
            }
         }
      }
      xhr.send(JSON.stringify(loginData));
   });
};

async function getCredentials() {
   return new Promise(function (resolve, reject) {
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
            resolve([email, password])
         });
         rl.stdoutMuted = true;
      });
   });
};


async function setStatus(newStatus, afterLoginCallback) {
   return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();

      const url = "https://discord.com/api/v9/users/@me/settings";
      xhr.open("PATCH", url);

      if (!("DISCORD_TOKEN" in process.env)) {
         console.log("No token provided, please login.");
         resolve(false); // TODO: resolve or reject? reject might throw unwanted errors
      }

      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("authorization", process.env["DISCORD_TOKEN"]);

      xhr.onreadystatechange = function () {

         if (xhr.readyState === 4) {
            console.log(xhr.responseText);
            if (xhr.status == 400) {
               console.log("Token invalid.");
               console.log("Please login.");
               resolve(false); // TODO: resolve or reject? reject might throw unwanted errors
            }
            resolve(true);
         }
      };

      var data = {status: newStatus};
      xhr.send(JSON.stringify(data));
   });
};

async function tryAgain() {

   return new Promise(function (resolve, reject) {
      
      var rl = readline.createInterface({
         input: process.stdin,
         output: process.stdout,
         terminal: true
      });

      rl.question('Retry (Y/n): ', function(answer) {
         rl.close();

         if (answer.toLowerCase() == 'y') {
            resolve(true);
         } else if (answer.toLowerCase() == 'n'){
            resolve(false);
         } else {
            console.log("Invalid answer.");
            resolve(tryAgain());
         }
      });
   });
}

module.exports = {
   setStatus,
   login,
   handleMFA
}

async function handleLoginProcess() {

   var [email, password] = await getCredentials();
   var result = await login(email, password);
      
   // mfa required
   if (result.mfa) {
      var authCode = await promptMFA()
   
      while (!(await handleMFA(result.ticket, authCode))) {
   
         if (!(await tryAgain())) {
            process.exit(0);
         }
   
         authCode = await promptMFA()
      }
   }
};

if (require.main === module) {
   // run directly from command line

   const argv = yargs
    .option('status', {
        alias: 's',
        description: 'Sets the given status in Discord',
        type: 'string',
    })
   .demandOption(['status'], 'Please a the status to set')
   .boolean('token')
   .alias('token', ['t'])
   .describe('token', 'Whether to log the token to the console')
   .help()
   .alias('help', 'h')
   .argv;

    const newStatus = argv.status;
    logToken = argv.token;

    if (!(["online", "dnd", "idle", "invisible"].includes(newStatus))) {
      console.log(`${newStatus} is no valid status. Use one of online, dnd, idle or invisible.`);
      process.exit(1);
    }

    (async () => {

      var tokenInEnv = "DISCORD_TOKEN" in process.env;

      while (!(tokenInEnv)) {
         console.log("DISCORD_TOKEN not set.")
         console.log("Starting authentication process.")

         await handleLoginProcess()

         tokenInEnv = "DISCORD_TOKEN" in process.env;

         if (!(tokenInEnv) && !(await tryAgain())) {
            process.exit(0);
         }
      }

      await setStatus(newStatus);
    })();
}


var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var readline = require('readline');
const yargs = require('yargs');



async function login(email, password) {
   return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();

      const authUrl = "https://discord.com/api/v9/auth/login";
      xhr.open("POST", authUrl);
      xhr.setRequestHeader("Content-Type", "application/json");

      loginData ={login:email, password:password}
      xhr.send(JSON.stringify(loginData));

      xhr.onreadystatechange = function () {
         if (xhr.readyState === 4) {
            if (xhr.status == 200) {
               var jsonResponse = JSON.parse(xhr.responseText);
               process.env["DISCORD_TOKEN"] = jsonResponse["token"]
               resolve(true)
            }

            if (xhr.status == 400) {
               console.log("Login failed, try again.")
               reject(false) //
            }
         }
      }
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
         console.log("No token provided, please login.")
         resolve(false) // TODO: resolve or reject? reject might throw unwanted errors
      }

      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.setRequestHeader("authorization", process.env["DISCORD_TOKEN"]);

      xhr.onreadystatechange = function () {

         if (xhr.readyState === 4) {
            if (xhr.status == 400) {
               console.log("Token invalid.")
               console.log("Please login.")
               resolve(false) // TODO: resolve or reject? reject might throw unwanted errors
            }
            resolve(true)
         }
      };

      var data = {status: newStatus};
      xhr.send(JSON.stringify(data));
   });
};

module.exports = {
   setStatus,
   login
}

if (require.main === module) {
   // run directly from command line

   const argv = yargs
    .option('status', {
        alias: 's',
        description: 'Set the given status.',
        type: 'string',
    })
    .demandOption(['status'], 'Please provide the status to set.')
    .help()
    .alias('help', 'h')
    .argv;

    const newStatus = argv.status;

    if (!(["online", "dnd", "idle", "invisible"].includes(newStatus))) {
      console.log(`${newStatus} is no valid status. Use one of online, dnd, idle or invisible.`);
      process.exit(1);
    }

    (async () => {
      while (!("DISCORD_TOKEN" in process.env)) {
         var [email, password] = await getCredentials();
         await login(email, password)
      }

      await setStatus(newStatus);
    })();
}


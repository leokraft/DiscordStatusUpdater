# Discord status updater

Allowes to change the Discord profile status.
Includes a function to login to discord, supporting 2FA, and receive the auth token. (might be seperated in the future)

## Install

Clone the repository, `cd` into it and run `npm install`.

## Usage

### CLI
---
Update your discord status by running
```sh
node status.js --status=NEW_STATUS
```
where `NEW_STATUS` can be one of 
- online
- dnd
- idle
- invisible

To get further information run `node status.js --help`.

### Module
---
Inside your code import `status` using

```js
var status = require('YOUR_PATH/status.js')
```

#### Set status

Set the status as follows
```js
status.setStatus(NEW_STATUS)
```
where `NEW_STATUS` can be one of 
- online
- dnd
- idle
- invisible

However if you have not set your auth token using the `DISCORD_TOKEN` enviroment variable `setStatus` will fail.\
To prevent this either set `DISCORD_TOKEN` or use the built-in login.

#### Login

To login use
```js
status.login(EMAIL, PASSWORD)
```
to login to your Discord account.\
This will automatically set the `DISCORD_TOKEN` enviroment variable.\
`login` returns a dictionary with `{success: bool, mfa: bool, ticket: null/string}`.

If you have 2FA enabled for you discord account, `mfa` will be true.

If that is the case use
```js
status.handleMFA(TICKET, AUTH_CODE)
```
to continue your login and provide the ticket returned by login and you private authentification code.

# Discord status updater

Allowes to change the Discord profile status.
Includes a function to login to discord, supporting 2FA, and receive the auth token. (might be seperated in the future)

## Contents
- [Install](#install)
- [Usage](#usage)
	- [CLI](#cli)
	- [Module](#module)
	  - [Set status](#set-status)
	  - [Login](#login)
	  - [MFA](#mfa)


## Install
<a name="install"></a>

Clone the repository, `cd` into it and run `npm install`.

## Usage
<a name="usage"></a>

### CLI
<a name="cli"></a>
---
Update your discord status by running
```sh
node status.js --status=NEW_STATUS
```
> `NEW_STATUS` can be one of online/dnd/idle/invisible

To get further information run `node status.js --help`.

> use `-t` flag to log you auth. token to console

### Module
<a name="module"></a>
---
Inside your code import `status` using

```js
var status = require('YOUR_PATH/status.js')
```

#### Set status
<a name="set-status"></a>
Set the status as follows
```js
status.setStatus(NEW_STATUS)
```
> `NEW_STATUS` can be one of online/dnd/idle/invisible

However if you have not set your auth token using the `DISCORD_TOKEN` enviroment variable `setStatus` will fail.\
To prevent this either set `DISCORD_TOKEN` or use the built-in login.

#### Login
<a name="login"></a>
Use
```js
status.login(EMAIL, PASSWORD)
```
to login to your Discord account.\
This will automatically set the `DISCORD_TOKEN` enviroment variable.\
`login` returns a dictionary with `{success: bool, mfa: bool, ticket: null/string}`.

#### Login
<a name="mfa"></a>
If you have 2FA enabled for you discord account, `mfa` will be true.

If that is the case use
```js
status.handleMFA(TICKET, AUTH_CODE)
```
to continue your login and provide the ticket returned by login and you private authentification code.

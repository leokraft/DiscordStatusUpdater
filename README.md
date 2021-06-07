# Discord status updater

Allowes to change the Discord profile status.
Also includes a function to login to discord and receive the auth token. (might be seperated in the future)

## Install

Clone the repository, `cd` into it and run `npm install`.

## Usage

### CLI

Update your discord status by running `node status.js --status=NEW_STATUS` where `NEW_STATUS` can be either `online`, `dnd`, `idle` or `invisible`.\
To get further information run `node status.js --help`.

### Module

Inside your code import status using `var status = require('YOUR_PATH/status.js')` afterwards you may use `status.setStatus(NEW_STATUS)` where `NEW_STATUS` can be either `online`, `dnd`, `idle` or `invisible`.\

However if you have not set your auth token using the `DISCORD_TOKEN` enviroment variable `setStatus` will fail.\
To prevent this either set `DISCORD_TOKEN` or use `status.login(EMAIL, PASSWORD)` to login to your Discord account. This will automatically set the `DISCORD_TOKEN` enviroment variable.

<img width="64" height="64" align="left" style="float: left; margin: 10px 10px 0 0;" alt="Icon" src="https://imgur.com/dRSYp1f.png">

# Sniper

> An easy to run simple bot that lets you snipe and editsnipe messages in your Discord server.

## Setup

Node.js 16.6.0 or newer is required.

1. Run:

```bash
$ git clone https://github.com/DankMemer/sniper.git 
$ cd ./sniper
```

2. Create config.json:
Both the values can be obtained from [here](https://discord.com/developers/applications)
```json
{
	"token": "<Your bot's token>", 
	"application_id": "<Your application's id>" , 
}
```

3. Run:

```shell
$ npm i
$ npm run register [guild id] 
$ npm run bot
```

Note:
Without specifying [guild id], snipe command will available on all your app's guilds. It will fan out slowly across all guilds, and will be guaranteed to be updated in an hour (due to Discord's cache).

With [guild id] it will be available only within the guild specified . It will update instantly.

## PM2
Though not necessary , using pm2 to handle your bot process is a good idea 
In short : it just restarts your bot on restart you can learn more about it [here](https://pm2.keymetrics.io/)
## License

[MIT](https://tldrlegal.com/license/mit-license)

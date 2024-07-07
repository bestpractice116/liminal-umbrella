# liminal-umbrella

This is a a Discord bot using the [sapphire framework][sapphire] written in TypeScript

https://discord.com/api/oauth2/authorize?client_id=XXX&permissions=406881299711&scope=bot%20applications.commands

## Environment settings

https://discord.com/developers/applications

-   General Information - Application ID -> DISCORD_APPLICATION_ID
-   General Information - Public Key -> DISCORD_PUBLIC_KEY
-   OAuth2 - Client Secret -> DISCORD_OAUTH_CLIENT_SECRET
-   Bot - Token -> DISCORD_BOT_TOKEN

### Environments

### Dev

https://discord.com/developers/applications/1206722586206281749/information

### Prod

## How to deploy it

### Prerequisite

```sh
fly volume create liminal_umbrella -s 1 -y -r iad
```

### Deploy

```sh
fly deploy
```

### Teardown

```sh
fly machine destroy --force
fly volume destroy
```

## Production

```sh
fly deploy -c fly-production.toml
```

# Dev webserver

```sh
$ yarn run dev
$ cd frontend ; yarn run dev

http://127.0.0.1:5173/

```

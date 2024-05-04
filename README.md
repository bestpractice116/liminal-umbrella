# liminal-umbrella 

This is a a Discord bot using the [sapphire framework][sapphire] written in TypeScript

https://discord.com/api/oauth2/authorize?client_id=XXX&permissions=406881299711&scope=bot%20applications.commands

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

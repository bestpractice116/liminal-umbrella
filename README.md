# liminal-umbrella 

This is a a Discord bot using the [sapphire framework][sapphire] written in TypeScript

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


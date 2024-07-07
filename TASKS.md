# Tasks that the RPG bot takes care of:

## Newly joining members

-   Adds the `AllUsers` role to the members [[code](src/cogs/addAllUsersRole/listeners/eventUserJoined.ts)].
-   Posts an introduction in #new_members [[code](src/cogs/greetNewUsers/listeners/eventUserJoined.ts)].

## Members changing nickname

-   Posts a nickname change log (with old and new nickname) into #bot-log [[code](src/cogs/logBotAction/listeners/eventUserChangedNickname.ts)].

## Members leaving

-   Posts a member left log (including their nickname) into #bot-log [[code](src/cogs/logBotAction/listeners/eventUserLeft.ts)].

## Cleaning up old messages

-   Deletes old messages (age > 7 days) which are not pinned from #location_booking [[code](src/cogs/deleteOldMessages/listeners/eventTickFive.ts)].

# Channels that things happen/are posted in

These are all controlled by the envs setup [here](env) - removing any setting will disable the relevant functionality.

# Random 'Playing...'

Just for fun, the bot has a [list of games](src/cogs/randomActivity/playing.txt) it lists itself as 'Playing' on Discord. This randomly changes [approximately every 4 hours](src/cogs/randomActivity/listeners/eventTickFive.ts#L17).

# RPGBot web interface

-   Dev: https://liminal-umbrella.fly.dev/
-   Prod: https://rpgbot.fly.dev/

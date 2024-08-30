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

# Roles associated with the Bot

  * BotBetaTester - these folks can see functionality that other users cannot.
  * Dungeon Master - allowed to post games
  * Admin - allowed to see (end edit) everyone's games, not just their own + other admin functionality.

# RPGBot web interface

-   Dev: https://liminal-umbrella.fly.dev/
-   Prod: https://rpgbot.fly.dev/

## Dungeon Master Screens

## View games

Allows DMs to view their upcoming and historical games. Selecting a game allows you to edit it, if the game is upcoming

## Post game

Allows DMs to setup, edit and post upcoming games. Details are saved as they are entered, so that you can part fill in the form and not lose your data if you leave and come back to it. Only one game can be in draft form at once. Once a game is posted, it is posted to Discord in the standard places.

## Admin Screens

### Users

List of all the Discord users and information about them

### Roles

List of all the roles in Discord that the bot is aware of, and information about them

### Gamesystems

List of game systems for which games can be run - this is used in the dropdown menu in the `Post Game` interface.

### Bot Playing

The list of activities that the bot randomly chooses from to be `Playing` at random times (on average about one change every 4 hours).

### Bot Messages

This screen allows specific messages / text that the bot puts into Discord to be edited by admins.

// #region imports
import * as fs from 'fs';
import { Telegraf } from 'telegraf';
import { as } from './appsettings.js';
import { repo } from './services/dbrepo.js';
import { Schedule } from './services/schedule.js';
// #endregion


// #region standart message options
const msgOps = {
    parse_mode: 'HTML'
};
// #endregion


// #region import commands
let commands = [];
fs.readdir('./commands', (err, files) => {
    if (err) console.error(err);

    // find .js files in directory
    var jsfiles = files.filter(f => f.split(".").pop() === "js");

    // import command modules from .js files
    jsfiles.forEach(file => {
        import(`./commands/${file}`)
            .then((result) => commands.push(result));
    });
});
// #endregion


// #region initialize instances
const bot = new Telegraf(as.telegram.token);
Schedule.getInstance().reload(bot, msgOps);
// #endregion


// react to text messages
bot.on('text', async (ctx) => {
    let user = await repo.getUser(ctx.from.id);
    if (user == null) {
        user = await repo.addUser(ctx.from.id);
    }
    
    // if message is not from the group
    if (ctx.chat.id != as.telegram.group_chat_id) {
        if (user.is_admin == 'false') {
            ctx.telegram.sendMessage(ctx.chat.id, 'Sorry! I only work inside my group');
            return;
        }
    }

    // check for an active session
    if (user.command_session != '' && !ctx.message.text.startsWith('/cancel')) {
        commands.forEach(async cmd => {
            if (cmd.cmd?.name == user.command_session) {
                cmd.cmd?.react(ctx, msgOps, user);
                return;
            }
        });
        return
    }

    // if not a command
    if (!ctx.message.text.startsWith('/')) return;

    // get command name
    let command = ctx.message.text
        .split(/\s+/)[0]
        .toLowerCase()
        .replace('/', '')
        .replace(as.telegram.bot_tag, '');

    // find command
    commands.forEach(async cmd => {
        if (cmd.cmd?.name == command) {
            if (command == 'help') {
                cmd.cmd?.execute(ctx, msgOps, user, commands);
                return;
            }

            if (cmd.cmd?.admin && user.is_admin == 'false') return;

            cmd.cmd?.execute(ctx, msgOps, user);
        }
    });
});


// launch bot
bot.launch();
bot.telegram.sendMessage(as.telegram.creator_id, 'Bot has reloaded!');
console.log('Bot has successfully launched!');
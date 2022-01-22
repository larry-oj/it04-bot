// #region imports
import * as fs from 'fs';
import { Telegraf } from 'telegraf';
import { as } from './appsettings.js';
// #endregion


// #region standart message options
const msgOps = {
    parse_mode: 'MarkdownV2'
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
// #endregion


// react to text messages
bot.on('text', (ctx) => {
    // if not a command
    if (!ctx.message.text.startsWith('/')) return;

    // split into arguments
    let args = ctx.message.text.split(/\s+/);

    // get command name
    let command = args[0].toLowerCase().replace('/', '');

    commands.forEach(cmd => {
        if (cmd.cmd?.name == command) {
            if (command == 'help') {
                cmd.cmd?.execute(ctx, msgOps, commands);
                return;
            }
            cmd.cmd?.execute(ctx, msgOps);
        }
    });
});


// launch bot
bot.launch();
console.log('Bot has successfully launched!');
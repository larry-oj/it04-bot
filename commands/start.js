import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'start',
    desc: 'Required to use the bot\\.',
    admin: false,
    execute: (ctx, msgOps) => {
        let message = `Hello ${ctx.message.from.first_name}\\!`;
        repo.addUser(ctx.message.from.id, (res, err) => {
            if (err != null) {
                message += `\nYou are already in the system\\!`;
            }
            else {
                message += `\nYou have been added to the system\\!`;
            }
            message += `\n\nUse \/help for the list of commands\\!`;
            ctx.telegram.sendMessage(ctx.message.chat.id, message, msgOps);
        });
    }
}
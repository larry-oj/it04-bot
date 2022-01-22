import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'stop',
    desc: 'Clears your data from bot\'s database\\.',
    admin: false,
    execute: (ctx, msgOps) => {
        let message = '';
        repo.deleteUser(ctx.message.from.id, (res, err) => {
            if (err != null) {
                message += `Error\\!\nIt looks like you are not in a database\\!`;
            }
            else {
                message += 'Your data has been successfully erased\\!';
            }
            ctx.telegram.sendMessage(ctx.message.chat.id, message, msgOps);
        });
    }
}
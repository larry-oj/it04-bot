import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'cancel',
    desc: 'Cancells current command session\\.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            if (res.rows[0].is_admin == false) {
                return;
            }

            repo.setUserSession(ctx.from.id, '', '', '', (res, err) => {
                ctx.telegram.sendMessage(ctx.chat.id, `Cancelled!`);
            });
        });
    }
}
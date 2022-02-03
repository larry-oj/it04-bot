import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'cancel',
    desc: 'Cancells current command session.',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        await repo.setUserSession(ctx.from.id, '', '', '');
        ctx.telegram.sendMessage(ctx.chat.id, `Cancelled!`);
    }
}
import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'start',
    desc: 'Bot intro.',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        let message = '-';
        ctx.telegram.sendMessage(ctx.chat.id, message);
    }
}
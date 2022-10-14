import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'weeknum',
    desc: 'Display current week number.',
    admin: false,
    execute: async (ctx, msgOps, user) => {
        let week = await repo.getWeek();
        let message = `Зараз ${week === 1 ? "перший" : "другий"} тиждень.`;
        ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
    }
}
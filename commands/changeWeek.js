import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'changeweek',
    desc: 'Change week number',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        let week = await repo.getWeek();
        await repo.changeWeek();
        let message = `Week has been changed from ${week} to ${week == 1 ? "2" : "1"}.`;
        ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
    }
}
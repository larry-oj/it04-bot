import { repo } from '../services/dbrepo.js';
import { cmd as cmd2 } from './today.js';

export const cmd = {
    name: 'tomorrow',
    desc: 'Show pairs for tomorrow.',
    admin: false,
    execute: async (ctx, msgOps, user) => {
        let d = new Date();
        let day_now = d.getDay();
        day_now++;

        if (day_now == 0 || day_now == 7) {
            day_now = 1;
        }

        let week_now = await repo.getWeek();

        let message = await cmd2.helper(week_now, day_now);
        
        ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
    }
}
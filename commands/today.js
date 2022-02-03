import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'today',
    desc: 'Show pairs for today.',
    admin: false,
    execute: async (ctx, msgOps, user) => {
        let d = new Date();
        let day_now = d.getDay();
        
        let week_now = await repo.getWeek();

        let day = await repo.getDay(week_now, day_now);

        let pair_groups = [[], [], [], [], [], []];
        day.forEach(p => {
            pair_groups[p.pair_id - 1].push(p);
        });

        let message = await cmd.helper(pair_groups);
        
        ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
    },
    helper: async (pair_groups) => {
        let times = await repo.getPairTimes();

        let message = '';
        pair_groups.forEach(group => {
            if (group.length < 1) return;
            let p_num = group[0].pair_id;
            message += `\n<b>Пара #${p_num}</b>\n<code>(${times[p_num - 1].begin.getHours()}:${('0' + times[p_num - 1].begin.getMinutes()).slice(-2)} - ${times[p_num - 1].end.getHours()}:${('0' + times[p_num - 1].end.getMinutes()).slice(-2)})</code>\n`;
            group.forEach(pair => {
                message += `${pair.name} (${pair.type})\n`;
            });
        });

        if (message == '') message = 'Пар нету!';

        return message;
    }
}
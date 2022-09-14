import { repo } from '../services/dbrepo.js';
import { cmd as cmd2 } from './now.js';

export const cmd = {
    name: 'next',
    desc: 'Show next pair.',
    admin: false,
    execute: async (ctx, msgOps, user) => {
        let times = await repo.getPairTimes();

        let week_now = await repo.getWeek();

        let date_now = new Date();
        let day_now = date_now.getDay();
        let time_now = new Date(`1970-01-01T${('0' + date_now.getHours()).slice(-2)}:${('0' + date_now.getMinutes()).slice(-2)}:00`);

        let best, in_proggress;
        [best, in_proggress] = cmd2.helper(times, time_now);

        if (in_proggress) {
            best++;           
        }

        if (best == 7) {
            best = 1;
            day_now++;
        } 

        if (day_now == 0 || day_now == 7) {
            day_now = 1;
        }

        let pairs = await repo.getPair(week_now, day_now, best);

        let message = `<b>Пара #${best}</b>\n<code>(${times[best - 1].begin.getHours()}:${('0' + times[best - 1].begin.getMinutes()).slice(-2)} - ${times[best - 1].end.getHours()}:${('0' + times[best - 1].end.getMinutes()).slice(-2)})</code>`;
        if (pairs.length < 1) {
            message += `\nВікно <i>(пуста пара)</i>`;
        }
        else {
            pairs.forEach(p => {
                message += `\n${p.name} (${p.type})`;
                if (p.link != null && p.link != 'null') {
                    message += ` - <a href=\"${p.link}\">посилання</a>`;
                }
            });
        }

        ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
    }
}
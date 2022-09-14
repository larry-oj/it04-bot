import { repo } from '../services/dbrepo.js';
import { cmd as cmd2 } from './now.js';

export const cmd = {
    name: 'left',
    desc: 'Show how much time is left.',
    admin: false,
    execute: async (ctx, msgOps, user) => {
        let times = await repo.getPairTimes();

        let week_now = await repo.getWeek();

        let date_now = new Date();
        let day_now = date_now.getDay();
        let time_now = new Date(`1970-01-01T${('0' + date_now.getHours()).slice(-2)}:${('0' + date_now.getMinutes()).slice(-2)}:00`);

        let best, in_proggress;
        [best, in_proggress] = cmd2.helper(times, time_now);

        let message = `<b>Пара #${best}</b>\n<code>(${times[best - 1].begin.getHours()}:${('0' + times[best - 1].begin.getMinutes()).slice(-2)} - ${times[best - 1].end.getHours()}:${('0' + times[best - 1].end.getMinutes()).slice(-2)})</code>`;
        if (!in_proggress) {
            message += '\nЗараз перерва';
        }
        else {
            let diff = times[best - 1].end.getTime() - time_now.getTime();
            let left = Math.floor((diff / 1000) / 60);
            message += `\nДо кінця пари: <b>${left} хв.</b>`;
        }

        ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
    }
}
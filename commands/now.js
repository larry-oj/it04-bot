import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'now',
    desc: 'Show current / closest pair.',
    admin: false,
    execute: async (ctx, msgOps, user) => {
        let times = await repo.getPairTimes();

        let week_now = await repo.getWeek();

        let date_now = new Date();
        let day_now = date_now.getDay();
        let time_now = new Date(`1970-01-01T${('0' + date_now.getHours()).slice(-2)}:${('0' + date_now.getMinutes()).slice(-2)}:00`); 

        let best, in_proggress;
        [best, in_proggress] = cmd.helper(times, time_now);

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
    },
    helper: (times, time_now) => {
        let best = 0;
        let in_progress = false;
        times.forEach(pair => {
            if (pair.begin.getTime() <= time_now.getTime() && time_now.getTime() <= pair.end.getTime()) {
                best = pair.id;
                in_progress = true;
            }
        });

        let diff = Number.MAX_SAFE_INTEGER;
        if (best == 0) {
            times.forEach(pair => {
                let tmp = Math.abs(time_now.getTime() - pair.begin.getTime());
                if (tmp < diff) {
                    diff = tmp;
                    best = pair.id;
                }
            });
        }

        return [best, in_progress];
    }
}
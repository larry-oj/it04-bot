import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'left',
    desc: 'Shows how much time is left\\.',
    admin: false,
    execute: (ctx, msgOps) => {
        repo.getPairTimes((res, err) => {
            if (err) { console.error(err); return; }

            let times = res.rows;

            let d = new Date();

            let hour_now = d.getHours();
            let minute_now = d.getMinutes();

            let best = 0;
            let diff = 10000;

            let in_proggress = false;
            times.forEach(pair => {
                if (pair.begin_hours <= hour_now && hour_now <= pair.end_hours) {
                    if ((hour_now == pair.begin_hours && minute_now >= pair.begin_minutes) ||
                        (hour_now == pair.end_hours && minute_now <= pair.end_minutes) ||
                        (pair.begin_hours < hour_now && hour_now < pair.end_hours)) {
                        best = pair.id;
                        in_proggress = true;
                    }
                }
            });

            if (best == 0) {
                times.forEach(pair => {
                    let tmp = Math.abs(hour_now - pair.begin_hours) * 60 + Math.abs(minute_now - pair.begin_minutes);
                    if (tmp < diff) {
                        diff = tmp;
                        best = pair.id;
                    }
                });
            }

            let message = `Пара #${best}\n(${times[best - 1].begin_hours}:${('0' + times[best - 1].begin_minutes).slice(-2)} - ${times[best - 1].end_hours}:${('0' + times[best - 1].end_minutes).slice(-2)})`;
            
            if (in_proggress) {
                let left = Math.abs(hour_now - times[best - 1].end_hours) * 60 - Math.abs(minute_now - times[best - 1].end_minutes);
                message += `\n\nДо конца пары: ${left} минут(-ы)`;
            }
            else {
                message += `\n\nСейчас перемена`;
            }
            
            ctx.telegram.sendMessage(ctx.chat.id, message);
        });
    }
}
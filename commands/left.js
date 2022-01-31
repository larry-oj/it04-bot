import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'left',
    desc: 'Show how much time is left.',
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

            let message = `<b>Пара #${best}</b>\n<code>(${times[best - 1].begin_hours}:${('0' + times[best - 1].begin_minutes).slice(-2)} - ${times[best - 1].end_hours}:${('0' + times[best - 1].end_minutes).slice(-2)})</code>`;
            
            if (in_proggress) {
                let tmp_d = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour_now, minute_now);
                let tmp_d2 = new Date(d.getFullYear(), d.getMonth(), d.getDate(), times[best - 1].end_hours, times[best - 1].end_minutes);
                let diff = tmp_d2 - tmp_d;
                let left = Math.floor((diff / 1000) / 60);
                message += `\nДо конца пары: <b>${left} мин.</b>`;
            }
            else {
                message += `\n<b>Сейчас перемена</b>`;
            }
            
            ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
        });
    }
}
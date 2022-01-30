import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'now',
    desc: 'Show current \\/ closest pair\\.',
    admin: false,
    execute: (ctx, msgOps) => {
        repo.getPairTimes((res, err) => {
            if (err) { console.error(err); return; }

            let times = res.rows;

            let d = new Date();

            let hour_now = d.getHours();
            let minute_now = d.getMinutes();
            let day_now = d.getDay();

            repo.getWeek((res, err) => {
                if (err) { console.error(err); return; }

                let week_now = +res.rows[0].num;

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

                repo.getPair(week_now, day_now, best, (res, err) => {
                    if (err) { console.error(err); return; }

                    let message = `Пара #${best}\n(${times[best - 1].begin_hours}:${times[best - 1].begin_minutes} - ${times[best - 1].end_hours}:${times[best - 1].end_minutes})`;
                    if (res == null || res.rows == null || res.rows.length < 1) {
                        message += `\nОкно (пустая пара)`;
                    }
                    else {
                        res.rows.forEach(row => {
                            message += `\n${row.name} (${row.type})`;
                            if (row.link != null && row.link != 'null') {
                                message += ` - ${row.link}`;
                            }
                        });

                        let left = 0;
                        if (in_proggress) {
                            left = Math.abs(hour_now - times[best - 1].end_hours) * 60 - Math.abs(minute_now - times[best - 1].end_minutes);
                        }
                        message += `\n\nДо конца пары: ${left} минут`;
                    }

                    ctx.telegram.sendMessage(ctx.chat.id, message);
                })
            });
        });
    }
}
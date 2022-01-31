import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'tomorrow',
    desc: 'Show pairs for tomorrow\\.',
    admin: false,
    execute: (ctx, msgOps) => {
        repo.getPairTimes((res, err) => {
            if (err) { console.error(err); return; }

            let times = res.rows;

            let d = new Date();
            let day_now = d.getDay();
            day_now++;

            if (day_now == 0 || day_now == 7) {
                day_now = 1;
            }

            repo.getWeek((res, err) => {
                if (err) { console.error(err); return; }

                let week_now = res.rows[0].num;

                repo.getDay(week_now, day_now, (res, err) => {
                    if (err) { console.error(err); return; }

                    let pair_groups = [[], [], [], [], [], []];
                    res.rows.forEach(row => {
                        pair_groups[row.pair_id - 1].push(row);
                    });

                    let message = '';
                    pair_groups.forEach(group => {
                        if (group.length < 1) return;
                        let p_num = group[0].pair_id;
                        message += `\nПара #${p_num}\n(${times[p_num - 1].begin_hours}:${('0' + times[p_num - 1].begin_minutes).slice(-2)} - ${times[p_num - 1].end_hours}:${('0' + times[p_num - 1].end_minutes).slice(-2)})\n`;
                        group.forEach(pair => {
                            message += `${pair.name} (${pair.type})\n`;
                        });
                    });

                    if (message == '') message = 'Завтра пар нету!';
                    ctx.telegram.sendMessage(ctx.chat.id, message);
                });
            });
        });
    }
}
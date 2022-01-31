import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'today',
    desc: 'Show pairs for today.',
    admin: false,
    execute: (ctx, msgOps) => {
        repo.getPairTimes((res, err) => {
            if (err) { console.error(err); return; }

            let times = res.rows;

            let d = new Date();
            let day_now = d.getDay();
            
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
                        message += `\n<b>Пара #${p_num}</b>\n<code>(${times[p_num - 1].begin_hours}:${('0' + times[p_num - 1].begin_minutes).slice(-2)} - ${times[p_num - 1].end_hours}:${('0' + times[p_num - 1].end_minutes).slice(-2)})</code>\n`;
                        group.forEach(pair => {
                            message += `${pair.name} (${pair.type})\n`;
                        });
                    });

                    if (message == '') message = 'Сегодня пар нету!';
                    ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
                });
            });
        });
    }
}
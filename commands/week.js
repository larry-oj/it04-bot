import { repo } from '../services/dbrepo.js';
import { cmd as cmd2 } from './today.js';

export const cmd = {
    name: 'week',
    desc: 'Show pairs for this week.',
    admin: false,
    execute: async (ctx, msgOps, user) => {
        let week_now = await repo.getWeek();

        let message = '';
        for (let day = 1; day <= 6; day++) {
            let tmp = '';
            switch (day) {
                case 1:
                    tmp = '<b><u>Понеділок</u>:</b>';
                    break;

                case 2:
                    tmp = '<b><u>Вівторок</u>:</b>';
                    break;

                case 3:
                    tmp = '<b><u>Середа</u>:</b>';
                    break;

                case 4:
                    tmp = '<b><u>Четвер</u>:</b>';
                    break;

                case 5:
                    tmp = '<b><u>П\'ятниця</u>:</b>';
                    break;

                case 6:
                    tmp = '<b><u>Субота</u>:</b>';
                    break;
            }

            message += tmp;
            message += await cmd2.helper(week_now, day);
            message += '~~~~~~~~~~~~~~~~~~~~\n\n';
        }

        ctx.telegram.sendMessage(ctx.chat.id, message, msgOps);
    }
}
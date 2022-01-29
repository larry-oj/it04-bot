import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'addpair',
    desc: 'Add pair to schedule \\(can only be used by admins\\)\\.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) {
                console.log(err);
                return;
            }

            if (res.rows[0].is_admin == false) {
                return;
            }
            else {
                let args = ctx.message.text.split('..');

                let week = args[1];
                let day = args[2];
                let pair = args[3];
                let name = args[4];
                let type = args[5];
                let link = args[6];

                repo.addPair(week, day, pair, name, type, link, (res, err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    ctx.telegram.sendMessage(ctx.chat.id, `Success!`);
                });
            }
        });
    }
}
import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'delete',
    desc: 'Assign pair to schedule.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            if (res.rows[0].is_admin == false) {
                return;
            }
            else {
                repo.setUserSession(ctx.from.id, 'delete', '', '1', (res, err) => {
                    if (err) { console.log(err); return; }

                    let message = `Deleting pair!\n(You can use \/cancel to cancel)\n\nSelect pair from the list:\n`

                    repo.getAllPairs((res, err) => {
                        if (err) { console.log(err); return; }

                        res.rows.forEach(row => {
                            message += `\n${row.id} - ${row.name} (${row.type})`;
                        });

                        ctx.telegram.sendMessage(ctx.chat.id, message);
                    });
                });
            }
        });
    },
    react: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            let sessionData = ctx.message.text;

            repo.deletePair(sessionData, (res, err) => {
                if (err) { console.log(err); return; }

                repo.setUserSession(ctx.from.id, '', '', '', (res, err) => {
                    if (err) { console.log(err); return; }

                    ctx.telegram.sendMessage(ctx.chat.id, 'Success!');
                });

                Schedule.getInstance().reload(null, msgOps);
            });
        });
    }
}
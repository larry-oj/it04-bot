import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'remove',
    desc: 'Remove pair from schedule.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            if (res.rows[0].is_admin == false) {
                return;
            }
            else {
                repo.setUserSession(ctx.from.id, 'remove', '', '1', (res, err) => {
                    if (err) { console.log(err); return; }

                    let message = `Removing pair!\n(You can use \/cancel to cancel)\n\nEnter week:\n`
                    ctx.telegram.sendMessage(ctx.chat.id, message);
                });
            }
        });
    },
    react: (ctx, msgOps) => {
        repo.getUser(ctx.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            let sessionStage = +res.rows[0].session_stage;
            let sessionData = res.rows[0].session_data;
            sessionData += ctx.message.text + '%%';

            let send = true;

            let response_message = '';
            switch (sessionStage) {
                case 1:
                    response_message += 'Enter day:\n1 - Monday\n2 - Tuesday\n...\n6 - Saturday';
                    break;

                case 2:
                    response_message += 'Enter pair number:\n1 - 6';
                    break;

                case 3:
                    send = false;

                    let data = sessionData.split('%%');
                    repo.getPair(data[0], data[1], data[2], (res, err) => {
                        if (err) { console.log(err); return; }

                        response_message += 'Choose pair:';
                        res.rows.forEach(row => {
                            response_message += `\n${row.id} - ${row.name} (${row.type})`;
                        });
                        ctx.telegram.sendMessage(ctx.chat.id, response_message);
                    });
                    break;

                case 4:
                    send = false;

                    let data1 = sessionData.split('%%');
                    repo.removePair(data1[0], data1[1], data1[2], data1[3], (res, err) => {
                        if (err) { console.log(err); return; }

                        repo.setUserSession(ctx.from.id, '', '', '', (res, err) => {
                            if (err) { console.log(err); return; }

                            ctx.telegram.sendMessage(ctx.chat.id, 'Success!');
                            sessionData = '';
                            sessionStage = '';
                        });

                        Schedule.getInstance().reload(null, msgOps);
                    });
                    break;
            }
            repo.setUserSession(ctx.from.id, null, sessionData, sessionStage + 1, (res, err) => {
                if (err) { console.log(err); return; }

                if (send) {
                    ctx.telegram.sendMessage(ctx.chat.id, response_message);
                }
            });
        });
    }
}
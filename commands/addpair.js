import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'addpair',
    desc: 'Add pair to schedule\\.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            if (res.rows[0].is_admin == false) {
                return;
            }
            else {
                repo.setUserSession(ctx.from.id, 'addpair', '', '1', (res, err) => {
                    if (err) { console.log(err); return; }

                    ctx.telegram.sendMessage(ctx.chat.id, `Adding new pair!\n(You can use \/cancel to cancel)\n\nEnter week:`);
                })
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
                    response_message += 'Enter pair name:\n(cyrillic / latin only, no symbols)';
                    break;

                case 4:
                    response_message += 'Enter pair type:';
                    break;

                case 5:
                    response_message += 'Enter link to pair:\n(if no link, send \'*\')';
                    break;

                case 6:
                    let data = sessionData.split('%%');
                    if (data[5] == '*') data[5] = null;

                    send = false;

                    repo.addPair(data[0], data[1], data[2], data[3], data[4], data[5], (res, err) => {
                        if (err) { console.log(err); return; }

                        repo.setUserSession(ctx.from.id, '', '', '', (res, err) => {
                            if (err) { console.log(err); return; }

                            ctx.telegram.sendMessage(ctx.chat.id, 'Success!');
                            sessionData = '';
                            sessionStage = '';
                        })
                    });
                    break;
            }
            repo.setUserSession(ctx.from.id, null, sessionData, sessionStage + 1, (res, err) => {
                if (err) { console.log(err); return; }

                if (send) {
                    ctx.telegram.sendMessage(ctx.chat.id, response_message);
                }

                Schedule.getInstance().reload(null, msgOps);
            });
        });
    }
}
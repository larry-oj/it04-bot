import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'assign',
    desc: 'Assign pair to schedule\\.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            if (res.rows[0].is_admin == false) {
                return;
            }
            else {
                repo.setUserSession(ctx.from.id, 'assign', '', '1', (res, err) => {
                    if (err) { console.log(err); return; }

                    let message = `Assigning pair!\n(You can use \/cancel to cancel)\n\nSelect pair from the list:\n`
                    
                    repo.getAllPairs((res, err) => {
                        if (err) { console.log(err); return; }

                        res.rows.forEach(row => {
                            message += `\n${row.id} - ${row.name} (${row.type})`;
                        });

                        ctx.telegram.sendMessage(ctx.chat.id, message);
                    });
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
                    response_message += 'Enter week:';
                    break;

                case 2:
                    response_message += 'Enter day:\n1 - Monday\n2 - Tuesday\n...\n6 - Saturday';
                    break;

                case 3:
                    response_message += 'Enter pair number:\n1 - 6';
                    break;

                case 4:
                    send = false;

                    let data = sessionData.split('%%');
                    repo.assignPair(data[1], data[2], data[3], data[0], (res, err) => {
                        if (err) { console.log(err); return; }
                        
                        response_message += 'Success!';
                        ctx.telegram.sendMessage(ctx.chat.id, response_message);
                        sessionData = '';
                        sessionStage = '';
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
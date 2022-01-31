import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'edit',
    desc: 'Edit pair in schedule.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            if (res.rows[0].is_admin == false) {
                return;
            }
            else {
                repo.setUserSession(ctx.from.id, 'edit', '', '1', (res, err) => {
                    if (err) { console.log(err); return; }

                    let message = `Editing pair!\n(You can use \/cancel to cancel)\n\nSelect pair from the list:\n`
                    
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
        repo.getUser(ctx.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            let sessionStage = +res.rows[0].session_stage;
            let sessionData = res.rows[0].session_data;
            sessionData += ctx.message.text + '%%';

            let send = true;

            let response_message = '';
            switch (sessionStage) {
                case 1:
                    response_message += 'Enter data, that will replace something (you will choose what later) (send \'*\' if you want to delete link):';
                    break;

                case 2:
                    response_message += 'What to do?\n1 - edit name\n2 - edit type\n3 - edit link';
                    break;

                case 3:
                    let data1 = sessionData.split('%%');

                    send = false;

                    let name = null;
                    let type = null;
                    let link = 'null';

                    switch (+data1[2]) {
                        case 1:
                            name = data1[1];
                            break;

                        case 2:
                            type = data1[1];
                            break;

                        case 3:
                            link = data1[1] == '*' ? 'null' : data1[1];
                            break;
                    }

                    repo.editPair(data1[0], name, type, link, (res, err) => {
                        if (err) { console.log(err); return; }

                        repo.setUserSession(ctx.from.id, '', '', '', (res, err) => {
                            if (err) { console.log(err); return; }

                            ctx.telegram.sendMessage(ctx.chat.id, 'Success!');
                            sessionData = '';
                            sessionStage = '';
                        });
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
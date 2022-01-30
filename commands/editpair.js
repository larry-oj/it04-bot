import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'editpair',
    desc: 'Edit pair in schedule\\.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            if (res.rows[0].is_admin == false) {
                return;
            }
            else {
                repo.setUserSession(ctx.from.id, 'editpair', '', '1', (res, err) => {
                    if (err) { console.log(err); return; }

                    ctx.telegram.sendMessage(ctx.chat.id, `Editing pair!\n(You can use \/cancel to cancel)\n\nEnter week:`);
                })
            }
        });
    },
    react: (ctx, msgOps) => {
        repo.getUser(ctx.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            let sessionStage = +res.rows[0].session_stage;
            let sessionData = res.rows[0].session_data;
            if (sessionStage != 4) {
                sessionData += ctx.message.text + '%%';
            }
            else {
                sessionData = ctx.message.text + '%%';
            }

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
                    let data = sessionData.split('%%');

                    send = false;

                    repo.getPair(data[0], data[1], data[2], (res, err) => {
                        if (err) { console.log(err); return; }

                        if (res == null || res.rows == null || res.rows.length < 1) {
                            repo.setUserSession(ctx.from.id, '', '', '', (res, err) => {
                                if (err) { console.log(err); return; }

                                ctx.telegram.sendMessage(ctx.chat.id, 'There are no pairs!');
                                sessionData = '';
                                sessionStage = '';
                            });
                            return;
                        }

                        let pair_list_message = 'Choose pair to edit:\n(Enter id)\n';
                        res.rows.forEach(row => {
                            pair_list_message += `\n${row.id} - ${row.name} (${row.type})`;
                        });

                        ctx.telegram.sendMessage(ctx.chat.id, pair_list_message);
                    });
                    break;

                case 4:
                    response_message += 'Enter data, that will replace something (you will choose what later) (send \'*\' if you want to delete link):';
                    break;

                case 5:
                    response_message += 'What to do?\n1 - edit name\n2 - edit type\n3 - edit link';
                    break;

                case 6:
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
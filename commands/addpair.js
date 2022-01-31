import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'add',
    desc: 'Add pair to list.',
    admin: true,
    execute: (ctx, msgOps) => {
        repo.getUser(ctx.message.from.id, (res, err) => {
            if (err) { console.log(err); return; }

            if (res.rows[0].is_admin == false) {
                return;
            }
            else {
                repo.setUserSession(ctx.from.id, 'add', '', '1', (res, err) => {
                    if (err) { console.log(err); return; }

                    ctx.telegram.sendMessage(ctx.chat.id, `Adding new pair!\n(You can use \/cancel to cancel)\n\nEnter name:`);
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
                    response_message += 'Enter pair type:';
                    break;

                case 2:
                    response_message += 'Enter link to pair:\n(if no link, send \'*\')';
                    break;

                case 3:
                    let data = sessionData.split('%%');
                    if (data[2] == '*') data[2] = null;

                    send = false;

                    repo.addPair(data[0], data[1], data[2], (res, err) => {
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
            });
        });
    }
}
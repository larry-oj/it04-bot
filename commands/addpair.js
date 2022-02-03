import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'add',
    desc: 'Add pair to list.',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        await repo.setUserSession(ctx.from.id, 'add', '', '1');

        ctx.telegram.sendMessage(ctx.chat.id, `Adding new pair!\n(You can use \/cancel to cancel)\n\nEnter name:`);
    },
    react: async (ctx, msgOps, user) => {
        let commandSession = null;
        let sessionStage = +user.session_stage;
        let sessionData = user.session_data;
        sessionData += ctx.message.text + '%%';

        let response_message = '';
        switch (sessionStage) {
            case 1:
                response_message += 'Enter pair type:';
                sessionStage++;
                break;

            case 2:
                response_message += 'Enter link to pair:\n(if no link, send \'*\')';
                sessionStage++;
                break;

            case 3:
                let data = sessionData.split('%%');

                if (data[2] == '*') data[2] = null;

                await repo.addPair(data[0], data[1], data[2]);
                
                response_message += 'Success!';
                commandSession = '';
                sessionData = '';
                sessionStage = '';
                break;
        }
        await repo.setUserSession(ctx.from.id, commandSession, sessionData, sessionStage);
            
        ctx.telegram.sendMessage(ctx.chat.id, response_message);
    }
}
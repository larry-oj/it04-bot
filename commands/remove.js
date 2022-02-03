import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'remove',
    desc: 'Remove pair from schedule.',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        await repo.setUserSession(ctx.from.id, 'remove', '', '1');

        let message = `Removing pair!\n(You can use \/cancel to cancel)\n\nEnter week:\n`
        ctx.telegram.sendMessage(ctx.chat.id, message);
    },
    react: async (ctx, msgOps, user) => {
        let commandSession = null;
        let sessionStage = +user.session_stage;
        let sessionData = user.session_data;
        sessionData += ctx.message.text + '%%';

        let response_message = '';
        let data = [];
        switch (sessionStage) {
            case 1:
                response_message += 'Enter day:\n1 - Monday\n2 - Tuesday\n...\n6 - Saturday';
                sessionStage++
                break;

            case 2:
                response_message += 'Enter pair number:\n1 - 6';
                sessionStage++
                break;

            case 3:
                data = sessionData.split('%%');
                let pairs = await repo.getPair(data[0], data[1], data[2]);
        
                response_message += 'Choose pair:';
                pairs.forEach(p => {
                    response_message += `\n${p.id} - ${p.name} (${p.type})`;
                });

                sessionStage++
                break;

            case 4:
                data = sessionData.split('%%');
                await repo.removePair(data[0], data[1], data[2], data[3]);

                response_message += 'Success!';
                
                commandSession = '';
                sessionData = '';
                sessionStage = '';

                Schedule.getInstance().reload(null, msgOps);
                break;
        }
        await repo.setUserSession(ctx.from.id, commandSession, sessionData, sessionStage);
        ctx.telegram.sendMessage(ctx.chat.id, response_message);
    }
}
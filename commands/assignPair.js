import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'assign',
    desc: 'Assign pair to schedule.',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        await repo.setUserSession(ctx.from.id, 'assign', '', '1');
            
        let pairs = await repo.getAllPairs();
            
        let message = `Assigning pair!\n(You can use \/cancel to cancel)\n\nSelect pair from the list:\n`
        pairs.forEach(p => {
            message += `\n${p.id} - ${p.name} (${p.type})`;
        });

        ctx.telegram.sendMessage(ctx.chat.id, message);
    },
    react: async (ctx, msgOps, user) => {            
        let commandSession = null;
        let sessionStage = +user.session_stage;
        let sessionData = user.session_data;
        sessionData += ctx.message.text + '%%';

        let response_message = '';
        switch (sessionStage) {
            case 1:
                response_message += 'Enter week:';
                sessionStage++;
                break;

            case 2:
                response_message += 'Enter day:\n1 - Monday\n2 - Tuesday\n...\n6 - Saturday';
                sessionStage++;
                break;

            case 3:
                response_message += 'Enter pair number:\n1 - 6';
                sessionStage++;
                break;

            case 4:
                let data = sessionData.split('%%');
                
                await repo.assignPair(data[1], data[2], data[3], data[0]);
                await repo.setUserSession(ctx.from.id, '', '', '');

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
import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'edit',
    desc: 'Edit pair in schedule.',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        await repo.setUserSession(ctx.from.id, 'edit', '', '1');

        let pairs = await repo.getAllPairs();
            
        let message = `Editing pair!\n(You can use \/cancel to cancel)\n\nSelect pair from the list:\n`
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
                response_message += 'Enter data, that will replace something (you will choose what later) (send \'*\' if you want to delete link):';
                sessionStage++;
                break;

            case 2:
                response_message += 'What to do?\n1 - edit name\n2 - edit type\n3 - edit link';
                sessionStage++;
                break;

            case 3:
                let data = sessionData.split('%%');

                let name = null;
                let type = null;
                let link = 'null';

                switch (+data[2]) {
                    case 1:
                        name = data[1];
                        break;

                    case 2:
                        type = data[1];
                        break;

                    case 3:
                        link = data[1] == '*' ? 'null' : data[1];
                        break;
                }

                await repo.editPair(data[0], name, type, link);
                    
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
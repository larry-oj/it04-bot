import { repo } from '../services/dbrepo.js';
import { Schedule } from '../services/schedule.js';

export const cmd = {
    name: 'delete',
    desc: 'Assign pair to schedule.',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        await repo.setUserSession(ctx.from.id, 'delete', '', '1');

        let pairs = await repo.getAllPairs();

        let message = `Deleting pair!\n(You can use \/cancel to cancel)\n\nSelect pair from the list:\n`;
        pairs.forEach(p => {
            message += `\n${p.id} - ${p.name} (${p.type})`;
        });

        ctx.telegram.sendMessage(ctx.chat.id, message);
    },
    react: async (ctx, msgOps, user) => {
        let sessionData = ctx.message.text;

        await repo.deletePair(sessionData);
        await repo.setUserSession(ctx.from.id, '', '', '');
            
        ctx.telegram.sendMessage(ctx.chat.id, 'Success!');

        Schedule.getInstance().reload(null, msgOps);
    }
}
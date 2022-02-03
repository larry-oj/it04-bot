import { repo } from '../services/dbrepo.js';

export const cmd = {
    name: 'list',
    desc: 'List pairs.',
    admin: true,
    execute: async (ctx, msgOps, user) => {
        let pairs = await repo.getAllPairs();

        let message = '';
        pairs.forEach(p => {
            message += `\n${p.id} - ${p.name} (${p.type})`;
        });

        ctx.telegram.sendMessage(ctx.chat.id, message);
    }
}
export const cmd = {
    name: 'how',
    desc: 'How the bot works\\!',
    admin: false,
    execute: (ctx, msgOps) => {
        var message = '[PH] /how';
        ctx.telegram.sendMessage(ctx.message.chat.id, message, msgOps);
    }
}
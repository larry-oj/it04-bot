export const cmd = {
    name: 'ping',
    desc: 'Super secret developer command\\!',
    admin: false,
    execute: (ctx, msgOps) => {
        var message = 'Pong\\!';
        ctx.telegram.sendMessage(ctx.message.chat.id, message, msgOps);
    }
}
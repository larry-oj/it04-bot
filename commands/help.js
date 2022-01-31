export const cmd = {
    name: 'help',
    desc: 'Show the list of commands.',
    admin: false,
    execute: (ctx, msgOps, commands) => {
        var message = `Here are my commands:`;
        commands.forEach(command => {
            if(command.cmd?.admin == false) {
                message += `\n/${command.cmd?.name} - ${command.cmd?.desc}`;
            }
        })
        ctx.telegram.sendMessage(ctx.message.chat.id, message, msgOps);
    }
}
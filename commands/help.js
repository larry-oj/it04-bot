export const cmd = {
    name: 'help',
    desc: 'Show the list of commands.',
    admin: false,
    execute: async (ctx, msgOps, user, commands) => {
        var message = `Here are my commands:`;
        commands.forEach(command => {
            if(command.cmd?.admin == false) {
                message += `\n/${command.cmd?.name} - ${command.cmd?.desc}`;
            }
            else if (user.is_admin == 'true') {
                message += `\n/${command.cmd?.name} - ${command.cmd?.desc}`;
            }
        })
        ctx.telegram.sendMessage(ctx.message.chat.id, message, msgOps);
    }
}
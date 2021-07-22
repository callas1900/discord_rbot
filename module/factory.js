module.exports = function(message, client) {
    const text = message.content
    let cmd
    if (message.mentions.users.has(client.user.id)) {
        cmd = require('./conversation.js')
        cmd.id = 'conversation'
    }
    else if (text === '!ping') {
        cmd = require('./ping.js')
        cmd.id = 'ping'
    }
    else if (text.startsWith('!mob')) {
        cmd = require('./mob.js')
        cmd.id = 'mob'
    }
    else if (text.startsWith('!syuzo')) {
        cmd = require('./syuzo.js')
        cmd.id = 'syuzo'
    }
    return cmd
}

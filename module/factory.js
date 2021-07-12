module.exports = function(text) {
    let cmd
    if (text === '!ping') {
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

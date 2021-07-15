// initialize
const Discord = require('discord.js')
const client = new Discord.Client()
require('discord-buttons')(client)
const dotenv = require('dotenv')
dotenv.config()
const factory = require('./module/factory.js')
const timerutil = require('./util/timer.js')
const taskutil = require('./util/task.js')
const buttons = require('./util/button.js')
const watcher = require('./module/watch_vc_state.js')

client.once('ready', () => { console.log('Ready!') })
client.on('message', async message => {
    if (!message.content.startsWith('!')) { return }
    const cmd = factory(message.content)
    if (!cmd) { return }
    try {
        const ret = await cmd.exec(message)
        if (ret.msg) { message.channel.send(!Array.isArray(ret.msg) ? ret.msg : ret.msg[0], ret.msg[1]) }
        if (ret.timers) { timerutil(ret.timers, cmd.id, taskutil(message)) }
    }
    catch (error) {
        console.error(error)
    }
})
client.on('clickButton', async (btn) => {
    const message = buttons.reply(btn)
    if (message) {
        await btn.reply.send(message)
        btn.reply.delete()
    }
})
client.on('voiceStateUpdate', (_oldState, _state) => {
    watcher.exec(client)
})
client.login(process.env.TOKEN)

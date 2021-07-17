// initialize
const Discord = require('discord.js')
const client = new Discord.Client()
require('discord-buttons')(client)
const dotenv = require('dotenv')
dotenv.config()
const factory = require('./module/factory.js')
const timerutil = require('./util/timer.js')
const taskFactory = require('./util/task.js')
const buttons = require('./util/button.js')
const watcher = require('./module/watch_vc_state.js')

client.once('ready', () => { console.log('Ready!') })
client.on('message', async message => {
    if (!message.content.startsWith('!')) { return }
    const cmd = factory(message.content)
    if (!cmd) { return }
    try {
        const ret = await cmd.exec(message)
        if (ret.msg) { message.channel.send(ret.msg.message, ret.msg.component) }
        if (ret.timers) { timerutil(ret.timers, message, taskFactory(message)) }
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
        btn.message.edit(message.content, null)
    }
})
client.on('voiceStateUpdate', (_oldState, _state) => {
    watcher.exec(client)
})
client.login(process.env.TOKEN)

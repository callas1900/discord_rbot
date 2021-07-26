// initialize
const Discord = require('discord.js')
const client = new Discord.Client()
require('discord-buttons')(client)
const dotenv = require('dotenv')
dotenv.config()
const factory = require('./module/factory.js')
const watcher = require('./module/watch_vc_state.js')
const timerutil = require('./util/timer.js')
const taskFactory = require('./util/task.js')
const buttons = require('./util/button.js')
const { setClient } = require('./util/store.js')

client.once('ready', () => {
    setClient(client)
    console.log('Ready!')
})
client.on('message', async message => {
    if (!(message.content.startsWith('!') || message.mentions.users.has(client.user.id))) { return }

    const cmd = factory(message, client)
    if (!cmd) { return }
    try {
        message.channel.startTyping()
        const ret = await cmd.exec(message)
        if (ret.msg && ret.msg.message) { message.channel.send(ret.msg.message, ret.msg.component ? ret.msg.component : null) }
        if (ret.timers) { timerutil(ret.timers, message, taskFactory(message)) }
    }
    catch (error) {
        console.error(error)
    }
    finally {
        message.channel.stopTyping()
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

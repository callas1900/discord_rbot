// initialize
const Discord = require('discord.js')
const client = new Discord.Client()
const dotenv = require('dotenv')
dotenv.config()
const factory = require('./module/factory.js')
const timerutil = require('./util/timer.js')
const watcher = require('./module/watch_vc_state.js')

client.once('ready', () => { console.log('Ready!') })
client.on('message', async message => {
    if (!message.content.startsWith('!') || message.author.bot) { return }
    const cmd = factory(message.content)
    if (!cmd) { return }
    try {
        const ret = await cmd.exec(message)
        if (ret.msg) { message.channel.send(ret.msg) }
        if (ret.timers) {
            timerutil(ret.timers, cmd.id,
                (m) => { message.channel.send(m) },
                async (s) => { (await message.member.voice.channel.join()).play(s)})
        }
    }
    catch (error) {
        console.error(error)
    }
})
client.on('voiceStateUpdate', (_oldState, _state) => {
    watcher.exec(client)
})

client.login(process.env.TOKEN)

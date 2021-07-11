// initialize
const Discord = require('discord.js')
const client = new Discord.Client()
const dotenv = require('dotenv')
dotenv.config()
const factory = require('./module/factory.js')
const timerutil = require('./util/timer.js')

client.once('ready', () => { console.log('Ready!') })
client.on('message', async message => {
    if (!message.content.startsWith('!') || message.author.bot) { return }
    const cmd = factory(message.content)
    if (!cmd) { return }
    try {
        const ret = await cmd.exec(message)
        if (ret.msg) { message.channel.send(ret.msg) }
        if (ret.timers) {
            timerutil(ret.timers, cmd.id, (m) => { message.channel.send(m) })
        }
    } catch (error) {
        console.error(error)
    }
});

client.login(process.env.TOKEN);

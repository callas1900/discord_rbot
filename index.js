// initialize
const Discord = require('discord.js')
const client = new Discord.Client()
const dotenv = require('dotenv')
dotenv.config()
const factory = require('./module/factory.js')
const timerutil = require('./util/timer.js')

client.once('ready', () => { console.log('Ready!') })
client.on('message', message => {
    const cmd = factory(message.content)
    if (!cmd) { return }
    const ret = cmd.exec(message)
    if (ret.msg) { message.channel.send(ret.msg) }
    if (ret.timers) {
        timerutil(ret.timers, cmd.id, (m) => { message.channel.send(m) })
    }
});

client.login(process.env.TOKEN);

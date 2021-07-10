// initialize
const Discord = require('discord.js');
const client = new Discord.Client();
const dotenv = require('dotenv');
dotenv.config();

client.once('ready', () => {
    console.log('Ready!');
});

// main
client.login(process.env.TOKEN);

client.on('message', message => {
    if (message.content === '!ping') {
        const ping = require('./module/ping.js')
        ping(message.content)
        message.channel.send(ping(message.content))
    } else if (message.content.startsWith('!mob')) {
        const mob = require('./module/mob.js')
        const ret = mob(message)
        message.channel.send(ret.msg)
        if (ret.timers) {
            ret.timers.forEach((timer) => {
                setTimeout(() => {message.channel.send(timer.message)}, timer.time*60*1000);
            });
        }
    } else if (message.content.startsWith('!syuzo')) {
        const syuzo = require('./module/syuzo.js')
        const ret = syuzo.exec(message)
        if (ret.msg) {
            message.channel.send(ret.msg)
        }
        if (ret.timers) {
            ret.timers.forEach((timer) => {
                setTimeout(() => {message.channel.send(timer.message)}, timer.time*60*1000);
            });
        }
    }
});

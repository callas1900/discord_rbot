// initialize
const Discord = require('discord.js');
const client = new Discord.Client();
const dotenv = require('dotenv');
var CONTINUE = false;
var count = 0;
var MEMBERS = [];
var INIT = true;
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
        if (message.content.includes('stop')) {
            console.log('stopping syuzo')
            count = 0
            CONTINUE=false
            return
        } 
        console.log('booting syuzo')
        const { says } = require('./module/syuzo.json')
        CONTINUE=true
        const sayit = () => {
            if (CONTINUE) {
                message.channel.send('松岡修造「' + says[count] + '」')
                count = count + 1
                if (count === 4) {
                    count = 0
                }
                console.log('set next syuzo')
                setTimeout(sayit, 3600*1000);
            }
        }
        sayit
    }
});

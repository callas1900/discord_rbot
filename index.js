// initialize
const Discord = require('discord.js');
const client = new Discord.Client();
const dotenv = require('dotenv');
const factory = require('./module/factory.js');
dotenv.config();

client.once('ready', () => {
    console.log('Ready!');
});

// main
client.login(process.env.TOKEN);

client.on('message', message => {
    const cmd = factory(message.content)
    if (!cmd) {
        return
    }
    const ret = cmd.exec(message)
    if (ret.msg) {
        message.channel.send(ret.msg)
    }
    if (ret.timers) {
        ret.timers.forEach((timer) => {
            setTimeout(() => {message.channel.send(timer.message)}, timer.time*60*1000);
        });
    }
});

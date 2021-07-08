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
function shuffle(a) {
   var j, x, i;
   for (i = a.length - 1; i > 0; i--) {
               j = Math.floor(Math.random() * (i + 1));
               x = a[i];
               a[i] = a[j];
               a[j] = x;
           }
   return a;
}

// main
client.login(process.env.TOKEN);

client.on('message', message => {
    console.log(message.content)
    if (message.content === '!ping') {
        message.channel.send('Pong.')
    } else if (message.content.startsWith('!mob')) {
        const commands = message.content.split(' ') 
        switch (commands[1]) {
            case 'help': {
                message.channel.send(':robot: まず `ready` を使ってね。`start`で開始だよ。後はずっとstartを使ってね。')
                break
            }
            case 'ready': {
                MEMBERS = []
                message.member.voice.channel.members.forEach((member) => {
                    console.log(member.user.username)
                    MEMBERS.push({'id': member.user.id, 'name': member.user.username})
                })
                let text = ':robot: メンバーは '
                MEMBERS.forEach(member => {text += member.name + " "})
                message.channel.send(text)
                break
            }
            case 'start': {
                message.member.voice.channel.members.forEach((member) => {
                    member[1].setMute(true)
                })
                if (INIT) {
                    message.channel.send(':robot: シャッフルしまーす')
                    MEMBERS = shuffle(MEMBERS)
                    let text = ':robot: '
                    MEMBERS.forEach(member => {text += member.name + " "})
                    message.channel.send(text)
                    message.channel.send(':robot: driver => ' + MEMBERS[0].name + ', navigator => ' + MEMBERS[1].name)
                    INIT = false
                } else {
                    message.channel.send(':robot: はじまるよー！')
                }
                const msg = () => {
                    let msg = ':robot: 5分たちました! '
                    MEMBERS.forEach(member => {
                        msg += `<@${member.id}> `
                    })
                    message.channel.send(msg)
                    const preDriver = MEMBERS.shift()
                    MEMBERS.push(preDriver)
                    message.channel.send(':robot: 次の driver は ' + MEMBERS[0].name + ' ,navigator は ' + MEMBERS[1].name)
                }
                const remind_msg = () => {
                    message.channel.send(':robot: 後1分！！！！！！')
                }
                var time = 5
                setTimeout(remind_msg, (time-1)*60*1000);
                setTimeout(msg, time*60*1000);
                break
            }
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

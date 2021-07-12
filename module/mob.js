var MEMBERS = []
var INIT = true
let DEBUG = false
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

module.exports.exec = async function(message) {
    const commands = message.content.split(' ') 
    let msg = ':robot: '
    let timers
    switch(commands[1]) {
        case 'ready': { 
            MEMBERS = []
            if (!message.member.voice.channel) {
                msg += 'voice チャンネルにjoinしてください'
                break
            }
            if (!DEBUG && message.member.voice.channel.members.size < 2) {
                msg += 'ぼっちなのでモブ出来ません'
                break
            }
            message.member.voice.channel.members.forEach((member) => {
                MEMBERS.push({'id': member.user.id, 'name': member.user.username})
            })
            msg += 'メンバーは '
            timers = []
            MEMBERS.forEach(member => {
                if (member.name != 'rbot') { msg += member.name + " " }
            })
            try {
                (await message.member.voice.channel.join()).play('./assets/car.mp3')
            } catch (error) {
                console.error(error)
            }
            break
        }
        case 'start': { 
            const time = commands[2] ? (isNaN(commands[2])) ? -99 : eval(commands[2]) : 5
            if (time < 2 || time > 30) {
                msg += '入力値は2以上、30以下です。'
                break
            }
            if (INIT) {
                MEMBERS = shuffle(MEMBERS)
                msg += 'シャッフルしまーす\n'
                MEMBERS.forEach(member => {msg += member.name + " "})
                msg += (`\ndriver => ${MEMBERS[0].name}, navigator => ${MEMBERS[(DEBUG) ? 0 : 1].name}`)
                INIT = false
            } else {
                msg += 'はじまるよー！'
            }
            let timer_msg = `:robot: ${time}分たちました! `
            MEMBERS.forEach(member => {
                timer_msg += `<@${member.id}> `
            })
            // setup for next
            const preDriver = MEMBERS.shift()
            MEMBERS.push(preDriver)
            timer_msg += `\n:robot: 次の driver は ${MEMBERS[0].name} ,navigator は ${MEMBERS[(DEBUG) ? 0 : 1].name}`
            // set timer
            timers = []
            timers.push({ message: timer_msg , time: time, sound: './assets/horn.mp3'})
            timers.push({ message: ':robot: 後1分！！！！！！', time: time-1 })
            break
        }
        case 'cancel': { 
            msg += 'はいよ！'
            timers = []
            break
        }
        case 'debug': { 
            msg += '\nMEMBERS:\n'
            msg += MEMBERS
            msg += '\nINIT:\n'
            msg += INIT
            msg += '\nDEBUG:\n'
            msg += DEBUG
            if (commands[2]) {
                DEBUG = commands[2] === 'true'
                msg += '\n!DEBUG: <= '
                msg += DEBUG
            }
            break
        }
        default: {
            msg += 'まず `ready` を使ってね。`start`で開始だよ。後はずっと`start`を使ってね。\n途中でとめたきゃ`cancel`'
            break
        }
    }
   return {msg: msg, timers: timers}
}


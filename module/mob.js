const MEMBERS = new Map()
const INIT = new Map()
let DEBUG = false
function shuffle(a) {
    let j, x, i
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1))
        x = a[i]
        a[i] = a[j]
        a[j] = x
    }
    return a
}

function setINIT(message, bool = true) {
    INIT.set(message.member.voice.channel.id, bool)
}

function getINIT(message) {
    return INIT.get(message.member.voice.channel.id)
}

function setMEMBERS(message, array = []) {
    MEMBERS.set(message.member.voice.channel.id, array)
}

function getMEMBERS(message) {
    return MEMBERS.get(message.member.voice.channel.id)
}

function init(message) {
    setMEMBERS(message)
    setINIT(message)
}

module.exports.getMembers = () => { return MEMBERS }

module.exports.exec = async function(message) {
    const commands = message.content.split(' ')
    let msg = ':robot: '
    let timers
    switch(commands[1]) {
    case 'ready': {
        if (!message.member.voice.channel) {
            msg += 'voice チャンネルにjoinしてください'
            break
        }
        init(message)
        const members = []
        message.member.voice.channel.members.forEach((member) => {
            if (member.user.username != 'rbot') {
                members.push({ 'id': member.user.id, 'name': member.user.username })
            }
        })
        if (!DEBUG && members.length < 2) {
            msg += 'ぼっちなのでモブ出来ません'
            break
        }
        msg += 'メンバーは '
        members.forEach(member => {
            msg += member.name + ' '
        })
        timers = []
        timers.push({ time: 0, sound: './assets/ada_morning.mp3' })
        setMEMBERS(message, members)
        break
    }
    case 'start': {
        const time = commands[2] ? (isNaN(commands[2])) ? -99 : eval(commands[2]) : 5
        let members = getMEMBERS(message)
        if (time < 2 || time > 30) {
            msg += '入力値は2以上、30以下です。'
            break
        }
        if (!members || members.length === 0) {
            msg += '`!mob ready` を先に実行してください'
            break
        }
        if (getINIT(message)) {
            members = shuffle(members)
            msg += 'シャッフルしまーす\n'
            members.forEach(member => {msg += member.name + ' '})
            msg += (`\ndriver => ${members[0].name}, navigator => ${members[(DEBUG) ? 0 : 1].name}`)
            setINIT(message, false)
        }
        else {
            msg += 'はじまるよー！'
        }
        let timer_msg = `:robot: ${time}分たちました! `
        members.forEach(member => {
            timer_msg += `<@${member.id}> `
        })
        // setup for next
        const preDriver = members.shift()
        members.push(preDriver)
        timer_msg += `\n:robot: 次の driver は ${members[0].name} ,navigator は ${members[(DEBUG) ? 0 : 1].name}`
        // set timer
        timers = []
        timers.push({ message: timer_msg, time: time, sound: './assets/ada_well_done.mp3' })
        timers.push({ message: ':robot: 後1分！！！！！！', time: time - 1 })
        setMEMBERS(message, members)
        break
    }
    case 'cancel': {
        msg += 'はいよ！'
        timers = []
        break
    }
    case 'debug': {
        msg += '\nMEMBERS:\n'
        MEMBERS.forEach((v, k) => {
            msg += `[${k}] = `
            v.forEach((user) => { msg += `[${user.id} : ${user.name}],` })
        })
        msg += '\nINIT:\n'
        INIT.forEach((v, k) => { msg += (`[${k}] = %o`, v) })
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
    return { msg: msg, timers: timers }
}


const buttonutil = require('../util/button.js')
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

function getOrderText(members) {
    return `\n${'-'.repeat(20)}\n:red_car: driver        => [${members[0].name}]\n:map: navigator => [${members[(DEBUG) ? 0 : 1].name}]\n${'-'.repeat(20)}`
}

module.exports.getMembers = () => { return MEMBERS }

module.exports.exec = async function(message) {
    const commands = message.content.split(' ')
    let msg = { message: ':robot: ', component: null }
    let timers
    switch(commands[1]) {
    case 'ready': {
        if (!message.member.voice.channel) {
            msg.message += 'voice チャンネルにjoinしてください'
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
            msg.message += 'ぼっちなのでモブ出来ません'
            break
        }
        msg.message += 'メンバーは '
        members.forEach(member => {
            msg.message += member.name + ' '
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
            msg.message += '入力値は2以上、30以下です。'
            break
        }
        if (!members || members.length === 0) {
            msg.message += '`!mob ready` を先に実行してください'
            break
        }
        if (getINIT(message)) {
            members = shuffle(members)
            msg.message += 'シャッフルしまーす => [ '
            members.forEach(member => {msg.message += member.name + ', '})
            msg.message += ' ]\n'
            msg.message += getOrderText(members)
            setINIT(message, false)
        }
        else {
            msg.message += 'はじまるよー！'
        }
        let timer_msg = `:robot: ${time}分たちました! `
        members.forEach(member => {
            timer_msg += `<@${member.id}> `
        })
        // setup for next
        const preDriver = members.shift()
        members.push(preDriver)
        timer_msg += (`\n:robot: ${getOrderText(members)}`)
        const startBtn = buttonutil.buttons.get('mob-start')
        // set timer
        timers = []
        timers.push({ message: [ timer_msg, startBtn ], time: time * 60, sound: './assets/ada_well_done.mp3' })
        timers.push({ message: ':robot: 後1分！！！！！！', time: (time - 1) * 60 })
        timers.push({ progress: '*'.repeat(time * 6), time: 0 })
        setMEMBERS(message, members)
        const cancelBtn = buttonutil.buttons.get('mob-cancel')
        msg.component = cancelBtn
        break
    }
    case 'cancel': {
        const members = getMEMBERS(message)
        msg.message += 'はいよ！'
        msg.message += getOrderText(members)
        timers = []
        break
    }
    case 'debug': {
        msg.message += '\nMEMBERS:\n'
        MEMBERS.forEach((v, k) => {
            msg.message += `{ ${k} => `
            v.forEach((user) => { msg.message += `[${user.id} : ${user.name}],` })
            msg.message += ' }\n'
        })
        msg.message += '\nINIT:\n'
        INIT.forEach((v, k) => { msg += (`${k} => ${v},\n`) })
        msg.message += '\nDEBUG:\n'
        msg.message += DEBUG
        if (commands[2]) {
            DEBUG = commands[2] === 'true'
            msg.message += '\n!DEBUG: <= '
            msg.message += DEBUG
        }
        break
    }
    case 'fire': {
        timers = []
        timers.push({ message: ':robot: ベクターキャノンモードヘ移行', time: 0, sound: './assets/ada_vector_canon.mp3' })
        timers.push({ message: ':robot: エネルギーライン、全段直結', time: 5 })
        timers.push({ message: ':robot: ランディングギア、アイゼン、ロック', time: 8 })
        timers.push({ message: ':robot: チャンバー内、正常加圧中', time: 11 })
        timers.push({ message: ':robot: ライフリング回転開始', time: 14 })
        timers.push({ message: ':robot: 撃てます', time: 16 })
        break
    }
    default: {
        msg.message += 'まず `ready` を使ってね。`start`で開始だよ。後はずっと`start`を使ってね。\n途中でとめたきゃ`cancel`'
        break
    }
    }
    return { msg: msg, timers: timers }
}


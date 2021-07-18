const buttonutil = require('../util/button.js')
const { INIT, MEMBERS, TIMERS } = require('../util/store.js')
const pm = require('./_process_manager.js'),
    mm = require('./_member_manager.js')
const startBtn = buttonutil.buttons.get('mob-start'),
    cancelBtn = buttonutil.buttons.get('mob-cancel')
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

function init(message) {
    MEMBERS.clear(message)
    INIT.clear(message)
}

module.exports.exec = async function(message) {
    const commands = message.content.split(' ')
    const msg = { message: ':robot: ', component: null }
    let timers
    switch(commands[1]) {
    case 'ready': {
        init(message)
        try {
            const members = mm.register(message)
            msg.message += pm.textBuilder('ready', [ members ])
            msg.component = startBtn
            MEMBERS.set(message, members)
        }
        catch (error) {
            msg.message += error
            break
        }
        const loader = pm.createLoader()
        loader.append(null, 0, './assets/ada_morning.mp3')
        timers = loader.load()
        break
    }
    case 'start': {
        const time = commands[2] ? (isNaN(commands[2])) ? -99 : eval(commands[2]) : 5
        if (time < 2 || time > 30) {
            msg.message += '入力値は2以上、30以下です。'
            break
        }
        let members = MEMBERS.get(message)
        if (!members || members.length === 0) {
            msg.message += '`!mob ready` を先に実行してください'
            break
        }
        msg.message += pm.textBuilder('start', [ INIT.get(message), members ])
        msg.component = cancelBtn
        if (INIT.get(message)) {
            members = shuffle(members)
            INIT.set(message, false)
        }
        // setup for next
        const preDriver = members.shift()
        members.push(preDriver)
        MEMBERS.set(message, members)
        const timer_msg = pm.textBuilder('start-timer', [ members, time ])
        // set timer
        const loader = pm.createLoader()
        loader.appendWithComponent(timer_msg, startBtn, time * 60, './assets/ada_well_done.mp3')
        loader.append(':robot: 後1分！！！！！！', (time - 1) * 60)
        loader.appendProgress('*'.repeat(time * 6))
        timers = loader.load()
        break
    }
    case 'cancel': {
        msg.message += pm.textBuilder('cancel', [ MEMBERS.get(message) ])
        msg.component = startBtn
        timers = []
        break
    }
    case 'debug': {
        msg.message += pm.textBuilder('debug', [ MEMBERS, INIT, TIMERS, commands[2] ])
        break
    }
    case 'fire': {
        // loader
        const loader = pm.createLoader()
        loader.append(':robot: ベクターキャノンモードヘ移行', 0, './assets/ada_vector_canon.mp3')
        loader.append(':robot: エネルギーライン、全段直結', 5)
        loader.append(':robot: ランディングギア、アイゼン、ロック', 8)
        loader.append(':robot: チャンバー内、正常加圧中', 11)
        loader.append(':robot: ライフリング回転開始', 14)
        loader.append(':robot: 撃てます', 16)
        timers = loader.load()
        break
    }
    default: {
        msg.message += 'まず `ready` を使ってね。`start`で開始だよ。後はずっと`start`を使ってね。\n途中でとめたきゃ`cancel`'
        break
    }
    }
    return { msg: msg, timers: timers }
}


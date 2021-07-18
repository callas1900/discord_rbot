const buttonutil = require('../util/button.js')
const { INIT, MEMBERS, TIMERS } = require('../util/store.js')
const pm = require('./_process_manager.js'), mm = require('./_member_manager.js')
const startBtn = buttonutil.buttons.get('mob-start'), cancelBtn = buttonutil.buttons.get('mob-cancel')

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
        timers = [pm.TimerBuilder().setSound('./assets/ada_morning.mp3')]
        break
    }
    case 'start': {
        let time = 0
        let members
        try {
            time = pm.getTime(commands[2])
            members = mm.load(message)
        }
        catch (error) {
            msg.message += error
            break
        }
        msg.message += pm.textBuilder('start', [ INIT.get(message), members ])
        msg.component = cancelBtn
        if (INIT.get(message)) {
            INIT.set(message, false)
        }
        mm.rotate(message, members)
        // set timer
        const timer_msg = pm.textBuilder('start-timer', [ members, time ])
        timers = [ pm.TimerBuilder().setMessage(timer_msg)
            .setComponent(startBtn).setTime(time * 60).setSound('./assets/ada_well_done.mp3'),
        pm.TimerBuilder().setMessage(':robot: 後1分！！！！！！').setTime((time - 1) * 60),
        pm.TimerBuilder().setProgress('*'.repeat(time * 6))]
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
        timers = [
            pm.TimerBuilder().setMessage(':robot: ベクターキャノンモードヘ移行').setSound('./assets/ada_vector_canon.mp3'),
            pm.TimerBuilder().setMessage(':robot: エネルギーライン、全段直結').setTime(5),
            pm.TimerBuilder().setMessage(':robot: ランディングギア、アイゼン、ロック').setTime(8),
            pm.TimerBuilder().setMessage(':robot: チャンバー内、正常加圧中').setTime(11),
            pm.TimerBuilder().setMessage(':robot: ライフリング回転開始').setTime(14),
            pm.TimerBuilder().setMessage(':robot: 撃てます').setTime(16)]
        break
    }
    default: {
        msg.message += 'まず `ready` を使ってね。`start`で開始だよ。後はずっと`start`を使ってね。\n途中でとめたきゃ`cancel`'
        break
    }
    }
    return { msg: msg, timers: (timers && timers.length > 0) ? pm.loadTimers(timers) : timers }
}


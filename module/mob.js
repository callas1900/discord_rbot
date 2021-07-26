const buttonutil = require('../util/button.js')
const { MEMBERS, TIMERS, clearAll, client } = require('../util/store.js')
const pm = require('./_process_manager.js'), mm = require('./_member_manager.js')
const startBtn = buttonutil.buttons.get('mob-start'), cancelBtn = buttonutil.buttons.get('mob-cancel')

module.exports.exec = async function(message) {
    const commands = message.content.split(' ')
    const msg = { message: ':robot: ', component: null }
    let timers
    switch(commands[1]) {
    case 'ready': {
        try {
            const id = commands[2] ? commands[2] : null
            const members = await mm.register(message, id)
            msg.message += pm.textBuilder('ready', [ members ])
            msg.component = startBtn
            clearAll(message)
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
            msg.message += pm.textBuilder('start', members)
            msg.component = cancelBtn
        }
        catch (error) {
            msg.message += error
            break
        }
        mm.rotate(message, members)
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
    case 'ninja': {
        if (!message.channel.members.get(client().user.id).hasPermission('MANAGE_MESSAGES')) {
            msg.message += '`MANAGE_MESSAGES` の権限はあっしにはねーっす'
        }
        else {
            const messages = await message.channel.messages.fetch({ limit:100 })
            let count = 0
            messages.filter(m => m.author.id === client().user.id).forEach((m) => {
                m.delete()
                count++
            })
            msg.message += `どろん！ ${count} の発言を消去`
        }
        break
    }
    case 'debug': {
        msg.message += pm.textBuilder('debug', [ MEMBERS, TIMERS, commands[2] ])
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


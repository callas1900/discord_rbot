const { DEBUG, setDebug } = require('../util/store.js')
class TimerLoader {
    constructor() { this.list = [] }

    appendProgress(progress) { this._append(null, null, 0, null, progress) }
    appendWithComponent(msg, component, time, sound = null) { this._append(msg, component, time, sound, null) }
    append(msg, time, sound = null) { this._append(msg, null, time, sound, null) }
    _append(msg, component, time, sound, progress) {
        const timer = {}
        if (msg) {
            const message = {}
            message.message = msg
            if (component) { message.component = component }
            timer.message = message
        }
        timer.time = time
        if (sound) { timer.sound = sound }
        if (progress) { timer.progress = progress }
        this.list.push(timer)
    }

    load() { return this.list }
}
module.exports.createLoader = () => { return new TimerLoader() }

function getOrderText(members) {
    return `\n${'-'.repeat(20)}\n:red_car: driver        => [${members[0].name}]\n:map: navigator => [${members[(DEBUG) ? 0 : 1].name}]\n${'-'.repeat(20)}`
}

module.exports.textBuilder = (cmd, args = []) => {
    let text = ''
    switch(cmd) {
    case 'ready': {
        const members = args[0]
        text += 'メンバーは '
        members.forEach(member => {
            text += member.name + ' '
        })
        break
    }
    case 'start': {
        const init = args[0]
        const members = args[1]
        if (init) {
            text += 'シャッフルしまーす => [ '
            members.forEach(member => {text += member.name + ', '})
            text += ' ]\n'
            text += getOrderText(members)
        }
        else {
            text += 'はじまるよー！'
        }
        break
    }
    case 'start-timer': {
        const members = args[0]
        const time = args[1]
        text += `:robot: ${time}分たちました! `
        members.forEach(member => {
            text += `<@${member.id}> `
        })
        text += (`\n:robot: ${getOrderText(members)}`)
        break
    }
    case 'cancel': {
        const members = args[0]
        text += 'はいよ！'
        text += getOrderText(members)
        break
    }
    case 'debug': {
        const MEMBERS = args[0]
        const INIT = args[1]
        const TIMERS = args[2]
        const debug = args[3]
        text += `\nMEMBERS:\n${MEMBERS.dump()}`
        text += `\nINIT:\n${INIT.dump()}`
        text += `\nTIMERS:\n${TIMERS.dump()}`
        text += `\nDEBUG = ${DEBUG()}`
        if (debug) {
            if (debug === 'true') { setDebug() }
            text += `\n!DEBUG: <= ${DEBUG()}`
        }
        break
    }
    }
    return text
}

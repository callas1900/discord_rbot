const { DEBUG, setDebug } = require('../util/store.js')
class TimerBuilder {
    constructor() {
        this.message = null
        this.component = null
        this.time = 0
        this.sound = null
        this.progress = null
    }

    setMessage(m) {
        this.message = m
        return this
    }
    setComponent(c) {
        this.component = c
        return this
    }
    setTime(t) {
        this.time = t
        return this
    }
    setSound(s) {
        this.sound = s
        return this
    }
    setProgress(p) {
        this.progress = p
        return this
    }

    build() {
        const timer = {}
        if (this.message) {
            timer.message = {}
            timer.message.message = this.message
            if (this.component) { timer.message.component = this.component }
        }
        timer.time = this.time
        if (this.sound) { timer.sound = this.sound }
        if (this.progress) { timer.progress = this.progress }
        return timer
    }
}
module.exports.TimerBuilder = () => { return new TimerBuilder() }
module.exports.loadTimers = (timers) => {
    const arr = []
    timers.forEach(timer => {
        arr.push(timer.build())
    })
    return arr
}

module.exports.getTime = (input) => {
    const time = input ? (isNaN(input)) ? -99 : eval(input) : 5
    if (time < 2 || time > 30) {
        throw '入力値は2以上、30以下です。'
    }
    return time
}

function getOrderText(members) {
    return `\n${'-'.repeat(20)}\n:red_car: driver        => [${members[0].name}]\n:map: navigator => [${members[(DEBUG()) ? 0 : 1].name}]\n${'-'.repeat(20)}`
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
        text += '\nシャッフルしまーす => [ '
        members.forEach(member => {text += member.name + ', '})
        text += ' ]\n'
        text += getOrderText(members)
        break
    }
    case 'start': {
        text += 'はじまるよー！'
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
        const TIMERS = args[1]
        const debug = args[2]
        text += `\nMEMBERS:\n${MEMBERS.dump()}`
        text += `\nTIMERS:\n${TIMERS.dump()}`
        text += `\nDEBUG = ${DEBUG()}`
        if (debug) {
            if (debug) {
                text += `\ninput = ${debug}`
                const b = (debug === 'true')
                text += `\n!DEBUG: <= ${b}`
                setDebug(b)
            }
        }
        break
    }
    }
    return text
}

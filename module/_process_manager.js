const { DEBUG, setDebug } = require('../util/store.js')
const { client } = require('../util/store.js')

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

module.exports.getMessages = async channel => {
    if (!channel.members.get(client().user.id).hasPermission('MANAGE_MESSAGES')) {
        throw '`MANAGE_MESSAGES` の権限はあっしにはねーっす'
    }
    return await channel.messages.fetch({ limit:100 })
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
    case 'ninja': {
        const messages = args[0]
        let count = 0
        messages.filter(m => m.author.id === client().user.id).forEach(m => {
            m.delete()
            count++
        })
        text += `どろん！ ${count} の発言を消去`
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

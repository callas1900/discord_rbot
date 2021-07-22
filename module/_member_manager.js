const { MEMBERS, DEBUG } = require('../util/store.js')
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

function retriveRegister(message, id) {
    let register
    if (id) {
        const clicker = message.channel.guild.members.cache.get(id)
        register = clicker.voice.channel ? clicker : null
    }
    else {
        register = message.member.voice.channel ? message.member : null
    }
    return register
}

module.exports.register = async (message, id) => {
    const register = retriveRegister(message, id)
    if (!register) {
        throw 'voice チャンネルにjoinしてください'
    }
    const members = []
    register.voice.channel.members.forEach((member) => {
        if (member.user.username != 'rbot') {
            members.push({ 'id': member.user.id, 'name': member.user.username })
        }
    })
    if (!DEBUG() && members.length < 2) {
        throw 'ぼっちなのでモブ出来ません'
    }
    await register.voice.channel.join()
    return shuffle(members)
}
module.exports.load = (message) => {
    const members = MEMBERS.get(message)
    if (!members || members.length === 0) {
        throw '`!mob ready` を先に実行してください'
    }
    return members
}
module.exports.rotate = (message, members) => {
    const preDriver = members.shift()
    members.push(preDriver)
    MEMBERS.set(message, members)
}

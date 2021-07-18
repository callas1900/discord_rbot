const { DEBUG } = require('../util/store.js')
module.exports.register = (message) => {
    if (!message.member.voice.channel) {
        throw 'voice チャンネルにjoinしてください'
    }
    const members = []
    message.member.voice.channel.members.forEach((member) => {
        if (member.user.username != 'rbot') {
            members.push({ 'id': member.user.id, 'name': member.user.username })
        }
    })
    if (!DEBUG() && members.length < 2) {
        throw 'ぼっちなのでモブ出来ません'
    }
    return members
}

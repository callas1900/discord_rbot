const _tasks = new Map()
module.exports = function(message) {
    _tasks.set('message', (m) => { message.channel.send(m) })
    _tasks.set('sound', async (s) => { (await message.member.voice.channel.join()).play(s)})
    return _tasks
}

const _tasks = new Map()
const posi = ':green_circle:'
const nega = ':black_circle:'
const prefix = 'progress:'
module.exports = function(message) {
    _tasks.set('message', (m) => {
        if (!m.component) { m.component = null }
        message.channel.send(m.message, m.component)
    })
    _tasks.set('sound', async (s) => {
        try {
            (await message.member.voice.channel.join()).play(s)
        }
        catch (e) {
            console.error(e)
        }
    })
    _tasks.set('progress', async (m) => {
        const scale = m.length
        const botmessage = await message.channel.send(prefix + posi.repeat(scale))
        let cursol = scale - 1
        const interval = setInterval(() => {
            if (cursol >= 0) {
                botmessage.edit(`${prefix} ${posi.repeat(cursol)}${nega.repeat(scale - cursol)}`)
                --cursol
            }
            else {
                botmessage.edit(prefix)
                clearInterval(interval)
                console.log('clear progress!')
            }
        }, 10 * 1000)
    })
    return _tasks
}

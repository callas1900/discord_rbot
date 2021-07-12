const { says } = require('./syuzo.config.json')

function shuffleArray(array) {
    let curId = array.length
    while (curId !== 0) {
        const randId = Math.floor(Math.random() * curId)
        curId -= 1
        const tmp = array[curId]
        array[curId] = array[randId]
        array[randId] = tmp
    }
    return array
}

module.exports.exec = function(message) {
    if (message.content.includes('stop')) {
        console.log('stopping syuzo')
        return { timers: [] }
    }
    const timers = []
    let count = 0
    const args = shuffleArray(says)
    args.forEach(say => {
        const msg = `松岡修造「${say}」`
        timers.push({ message: msg, time: count * 60 })
        count += 1
    })
    return { timers: timers }
}


const { says } = require('./syuzo.config.json')

function shuffleArray(array) { let curId = array.length;
    while (0 !== curId) { 
        let randId = Math.floor(Math.random() * curId);
        curId -= 1;
        let tmp = array[curId];
        array[curId] = array[randId];
        array[randId] = tmp;
    }
    return array;
}

module.exports.exec = function(message) {
    if (message.content.includes('stop')) {
        console.log('stopping syuzo')
        return {timers: null}
    } 
    const timers = []
    let count = 0
    let args = shuffleArray(says)
    args.forEach(say => {
        const msg = `松岡修造「${say}」`
        timers.push({message: msg, time: count*60})
        count += 1
    })
    return {timers: timers}
}


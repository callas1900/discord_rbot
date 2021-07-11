function clear(id) {
    if (TIMERS.get(id)) {
        TIMERS.get(id).forEach((t) => {
            clearTimeout(t)
        })
        TIMERS.set(id, [])
    }
}
const TIMERS = new Map()
module.exports = function(timers, id, task, voice=null) {
    if (timers.length === 0) {
        clear(id)
    } else {
        if (!TIMERS.get(id)) {
            TIMERS.set(id, [])
        }
        timers.forEach((timer) => {
            let order
            if (timer.sound) {
                order = () => {
                    task(timer.message)
                    if (voice) { voice(timer.sound) }
                }
            } else {
                order = () => { task(timer.message) }
            }
            let t = setTimeout(order, timer.time*60*1000)
            TIMERS.get(id).push(t)
        });
    }
}
module.exports.list = () => { return TIMERS }

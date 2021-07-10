const TIMERS = new Map()
module.exports = function(timers, id, task) {
    if (timers.length === 0) {
        if (TIMERS.get(id)) {
            TIMERS.get(id).forEach((t) => {
                clearTimeout(t)
            })
            TIMERS.set(id, [])
        }
    } else {
        if (!TIMERS.get(id)) {
            TIMERS.set(id, [])
        }
        timers.forEach((timer) => {
            let t = setTimeout(() => {task(timer.message)}, timer.time*60*1000)
            TIMERS.get(id).push(t)
        });
    }
}
module.exports.list = () => { return TIMERS }

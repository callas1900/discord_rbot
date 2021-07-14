function clear(id) {
    if (TIMERS.get(id)) {
        TIMERS.get(id).forEach((t) => {
            clearTimeout(t)
        })
        TIMERS.set(id, [])
    }
}
const TIMERS = new Map()
module.exports = function(timers, id, tasks) {
    if (timers.length === 0) {
        clear(id)
    }
    else {
        if (!TIMERS.get(id)) {
            TIMERS.set(id, [])
        }
        timers.forEach((timer) => {
            const order = () => {
                tasks.forEach((fn, arg) => {
                    if (Reflect.has(timer, arg)) {
                        fn(Reflect.get(timer, arg))
                    }
                })
            }
            const t = setTimeout(order, timer.time * 1000)
            TIMERS.get(id).push(t)
        })
    }
}
module.exports.list = () => { return TIMERS }

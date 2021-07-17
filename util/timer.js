const { TIMERS } = require('./store.js')
module.exports = function(timers, message, tasks) {
    if (timers.length === 0) {
        TIMERS.clear(message)
    }
    else {
        if (!TIMERS.get(message)) {
            TIMERS.set(message, [])
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
            TIMERS.get(message).push(t)
        })
    }
}

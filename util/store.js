class Timers {
    constructor() {
        this.timers = new Map()
        this.size = this.timers.size
    }

    get(id) {
        return this.timers.get(id)
    }

    set(id, timer) {
        this.timers.set(id, timer)
        this.size = this.timers.size
    }

    clear(id) {
        if (this.timers.get(id)) {
            this.timers.get(id).forEach((t) => {
                clearTimeout(t)
            })
            this.timers.set(id, [])
        }
        this.size = this.timers.size
    }
    dump() {
        return this.timers
    }
}
const timersHolder = new Timers()
module.exports.TIMERS = timersHolder

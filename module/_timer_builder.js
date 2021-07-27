class TimerBuilder {
    constructor() {
        this.message = null
        this.component = null
        this.time = 0
        this.sound = null
        this.progress = null
    }

    setMessage(m) {
        this.message = m
        return this
    }
    setComponent(c) {
        this.component = c
        return this
    }
    setTime(t) {
        this.time = t
        return this
    }
    setSound(s) {
        this.sound = s
        return this
    }
    setProgress(p) {
        this.progress = p
        return this
    }

    build() {
        const timer = {}
        if (this.message) {
            timer.message = {}
            timer.message.message = this.message
            if (this.component) { timer.message.component = this.component }
        }
        timer.time = this.time
        if (this.sound) { timer.sound = this.sound }
        if (this.progress) { timer.progress = this.progress }
        return timer
    }
}
module.exports.TimerBuilder = () => { return new TimerBuilder() }
module.exports.loadTimers = (timers) => {
    const arr = []
    timers.forEach(timer => {
        arr.push(timer.build())
    })
    return arr
}

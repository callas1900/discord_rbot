class Timers {
    constructor() {
        this.timers = new Map()
        this.size = this.timers.size
    }

    _getId(message) {
        if (!(message && message.member && message.member.voice && message.member.voice.channel)) {
            console.error('irregal argument')
            return null
        }
        return message.member.voice.channel.id
    }

    get(message) {
        const id = this._getId(message)
        if (!this.timers.get(id)) {
            this.timers.set(id, [])
        }
        return (id) ? this.timers.get(id) : null
    }

    set(message, timer) {
        const id = this._getId(message)
        if (!id) { return }
        this.timers.set(id, timer)
        this.size = this.timers.size
    }

    clear(message) {
        const id = this._getId(message)
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

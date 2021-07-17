class Store {
    constructor(initializer) {
        this.store = new Map()
        this.size = this.store.size
        this.initializer = initializer
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
        if (this.store.get(id) === undefined) {
            this.store.set(id, this.initializer())
        }
        return (id) ? this.store.get(id) : null
    }

    set(message, arg) {
        const id = this._getId(message)
        if (!id) { return }
        this.store.set(id, arg)
        this.size = this.store.size
    }

    clear(message) {
        const id = this._getId(message)
        if (this.store.get(id)) {
            const init = this.initializer(this.store.get(id))
            this.store.set(id, init)
        }
        this.size = this.store.size
    }
    dump() {
        let text = `store size = ${this.store.size}\n`
        this.store.forEach((v, k) => {
            text += `   ${k}: [${(Array.isArray(v) ? v.length : v)}]\n`
        })
        return text
    }
}
const timersHolder = new Store((timers) => {
    if (timers) {
        timers.forEach((t) => { clearTimeout(t) })
    }
    return []
})
const initHolder = new Store(() => { return true })
module.exports.TIMERS = timersHolder
module.exports.INIT = initHolder

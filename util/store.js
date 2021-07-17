class Store {
    constructor(initializer, dumper) {
        this.store = new Map()
        this.size = this.store.size
        this.initializer = initializer
        this.dumper = dumper
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
            this.store.set(id, this.initializer(this.store.get(id)))
        }
        this.size = this.store.size
    }
    dump() {
        let text = `store size = ${ this.store.size }\n`
        this.store.forEach((v, k) => {
            text += `----${ k }: [${ this.dumper(v) }]\n`
        })
        return text
    }
}

const timersHolder = new Store((timers) => {
    if (timers) {
        timers.forEach((t) => { clearTimeout(t) })
    }
    return []
}, (timers) => { return timers.length })
const initHolder = new Store(() => { return true },
    (v) => { return `----${v}` })
const membersHolder = new Store(() => { return [] },
    (users) => {
        let text = ''
        users.forEach(user => { text += `\n---------[${user.id} : ${user.name}],` })
        return text
    })

module.exports.TIMERS = timersHolder
module.exports.INIT = initHolder
module.exports.MEMBERS = membersHolder

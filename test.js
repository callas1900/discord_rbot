const test = require('ava')
const Discord = require('discord.js')
const mob = require('./module/mob.js')
const buttonutil = require('./util/button.js')
const store = require('./util/store.js')
const startBtn = buttonutil.buttons.get('mob-start'),
    cancelBtn = buttonutil.buttons.get('mob-cancel'),
    readyBtn = buttonutil.buttons.get('mob-ready')

function createClient(id = Discord.SnowflakeUtil.generate()) {
    return { user: { id: id }, voice: { connections: new Map() } }
}

function createMessageChain(message, text, names = []) {
    return createMessage(text, names, message.member.voice.channel.id)
}

function createMessage(text, names = [], id = Discord.SnowflakeUtil.generate()) {
    const members = new Map()
    names.forEach((name)=> {
        members.set(Discord.SnowflakeUtil.generate(), createMember(name))
    })
    return {
        content: text,
        channel: { id: Discord.SnowflakeUtil.generate(), send: () => {
            // empty
        } },
        member: { voice: { channel: {
            id: id,
            members: members,
            join: (() => {
                return { play: (_file) => {
                    // empty
                } }
            }),
        } } },
        mentions: { users: new Map() }
    }
}

function createMember(name, id = Discord.SnowflakeUtil.generate()) {
    return { user:{ id: id, username: name } }
}

function checkOrderList(t, lines) {
    t.is(lines[0], '-'.repeat(20))
    t.regex(lines[1], /:red_car:[ ]driver[ ]{8}=>[ ]\[...\]/)
    t.regex(lines[2], /:map:[ ]navigator[ ]=>[ ]\[...\]/)
    t.not(lines[1].split('=> ')[1], lines[2].split('=> ')[1])
    t.is(lines[3], '-'.repeat(20))
}

test('ping pong', t => {
    const ping = require('./module/ping.js')
    const message = createMessage('!ping')
    const ret = ping.exec(message)
    t.is(ret.msg.message, 'Pong.')
})

test('syuzo', t => {
    const message = createMessage('!syuzo')
    const syuzo = require('./module/syuzo.js')
    const { says } = require('./module/syuzo.config.json')
    const ret = syuzo.exec(message)
    t.is(ret.msg, undefined)
    t.is(ret.timers.length, says.length)
    t.is(ret.timers[0].time, 0)
    t.is(ret.timers[1].time, 60 * 60)
})
test('syuzo stop', t => {
    const message = createMessage('!syuzo stop')
    const syuzo = require('./module/syuzo.js')
    const ret = syuzo.exec(message)
    t.is(ret.timers.length, 0)
})

test('mob help', async t => {
    const message = createMessage('!mob help')
    const exp = ':robot: まず `ready` を使ってね。`start`で開始だよ。後はずっと`start`を使ってね。\n途中でとめたきゃ`cancel`'
    t.like((await mob.exec(message)).msg, { message: exp, component: null })
})

test('mob ready (not joining voice chat)', async t => {
    const message = { content:'!mob ready', member: { voice: { channel: null } } }
    t.like((await mob.exec(message)).msg, { message: ':robot: voice チャンネルにjoinしてください', component: null })
})

test('mob ready (user is alone)', async t => {
    const message = createMessage('!mob ready', ['aaa'])
    t.like((await mob.exec(message)).msg, { message: ':robot: ぼっちなのでモブ出来ません', component: null })
})

test('mob start initialization', async t => {
    const message = createMessage('!mob start')
    const ret = await mob.exec(message)
    t.like(ret.msg, { message: ':robot: `!mob ready` を先に実行してください', component: null })
    t.is(ret.timers, undefined)
})

test('mob ready', async t => {
    const message = createMessage('!mob ready', ['aaa', 'bbb', 'ccc'])
    const ret = await mob.exec(message)

    const splited = ret.msg.message.split('\n')
    t.regex(splited[0], /:robot: メンバーは ... ... ... /)
    t.regex(splited[1], /シャッフルしまーす => \[[ ]...,[ ]...,[ ]...,[ ]{2}\]/)
    t.is(splited[2], '')
    checkOrderList(t, splited.slice(3, 7))
    t.is(ret.msg.component, startBtn)
    t.is(ret.timers.length, 1)
    t.like(ret.timers[0], {
        time: 0,
        sound: './assets/ada_morning.mp3',
    })
})

test('mob start', async t => {
    // ready
    let message = createMessage('!mob ready', ['aaa', 'bbb', 'ccc'])
    let ret = await mob.exec(message)
    // start
    message = createMessageChain(message, '!mob start')
    ret = await mob.exec(message)
    t.is(ret.msg.message, ':robot: はじまるよー！')
    t.is(ret.msg.component, cancelBtn)
    t.is(ret.timers.length, 3)
    t.like(ret.timers[0], {
        time: 5 * 60,
        sound: './assets/ada_well_done.mp3',
    })
    const splited = ret.timers[0].message.message.split('\n')
    t.regex(splited[0], /:robot: 5分たちました! <@[0-9].+> <@[0-9].+> <@[0-9].+>/)
    t.regex(splited[1], /:robot: /)
    checkOrderList(t, splited.slice(2, 6))
    t.is(ret.timers[0].message.component, startBtn)
    t.like(ret.timers[1], {
        time: 4 * 60,
        sound: undefined,
    })
    t.like(ret.timers[1].message, { message: ':robot: 後1分！！！！！！' })
    t.is(ret.timers[2].progress, '*'.repeat(5 * 6))
    // continue
    t.like((await mob.exec(message)).msg, { message: ':robot: はじまるよー！', component: cancelBtn })
    t.like((await mob.exec(message)).msg, { message: ':robot: はじまるよー！', component: cancelBtn })
    t.like((await mob.exec(message)).msg, { message: ':robot: はじまるよー！', component: cancelBtn })
})

test('mob start with number', async t => {
    // ready
    const message = createMessage('!mob ready', ['aaa', 'bbb', 'ccc'])
    let ret = await mob.exec(message)
    t.truthy(ret.msg.message)
    t.is(ret.msg.component, startBtn)
    // start
    const message2 = createMessageChain(message, '!mob start 4')
    ret = await mob.exec(message2)
    t.is(ret.timers.length, 3)
    t.like(ret.timers[0], {
        time: 240,
        sound: './assets/ada_well_done.mp3',
    })
    const splited = ret.timers[0].message.message.split('\n')
    t.regex(splited[0], /:robot: 4分たちました! <@[0-9].+> <@[0-9].+> <@[0-9].+>/)
    t.is(splited[1], ':robot: ')
    checkOrderList(t, splited.slice(2, 6))
    t.like(ret.timers[1], {
        time: 180,
        sound: undefined,
    })
    t.is(ret.timers[0].message.component, startBtn)
    t.like(ret.timers[1].message, { message: ':robot: 後1分！！！！！！' })
    t.is(ret.timers[2].progress, '*'.repeat(4 * 6))
    const message3 = createMessageChain(message, '!mob start 2')
    t.is((await mob.exec(message3)).timers[0].time, 2 * 60)
    const message4 = createMessageChain(message, '!mob start 1')
    t.is((await mob.exec(message4)).timers, undefined)
    t.like((await mob.exec(message4)).msg, { message: ':robot: 入力値は2以上、30以下です。', component: null })
    const message5 = createMessageChain(message, '!mob start 30')
    t.is((await mob.exec(message5)).timers[0].time, 30 * 60)
    const message6 = createMessageChain(message, '!mob start 31')
    t.is((await mob.exec(message6)).timers, undefined)
    t.like((await mob.exec(message6)).msg, { message: ':robot: 入力値は2以上、30以下です。', component: null })
    const message7 = createMessageChain(message, '!mob start aaa')
    t.is((await mob.exec(message7)).timers, undefined)
    t.like((await mob.exec(message7)).msg, { message: ':robot: 入力値は2以上、30以下です。', component: null })
})

test('mob cancel', async t => {
    // ready
    let message = createMessage('!mob ready', ['aaa', 'bbb', 'ccc'])
    t.is((await mob.exec(message)).timers.length, 1)
    // start
    message = createMessageChain(message, '!mob start')
    t.is((await mob.exec(message)).timers[0].time, 5 * 60)
    // cancel
    message = createMessageChain(message, '!mob cancel')
    const ret = await mob.exec(message)
    const splited = ret.msg.message.split('\n')
    t.is(splited[0], ':robot: はいよ！')
    checkOrderList(t, splited.slice(1, 5))
    t.is(ret.timers.length, 0)
})

test('factory no command', t => {
    const factory = require('./module/factory.js')
    const message = createMessage('ping')
    const client = createClient()
    t.is(factory(message, client), undefined)
})

test('factory', t => {
    const factory = require('./module/factory.js')
    const client = createClient()
    let message = createMessage('!ping')
    t.is(factory(message, client).id, 'ping')
    message = createMessage('!mob')
    t.is(factory(message, client).id, 'mob')
    message = createMessage('!syuzo')
    t.is(factory(message, client).id, 'syuzo')
})

test('timer util', t => {
    const timerutil = require('./util/timer.js')
    const task = [
        () => {
            // dummy function
        },
        () => {
            // dummy function
        },
    ]
    const timer1 = { message: 'test-message', time: 0 }
    // id check
    const message1 = createMessage('1')
    const message2 = createMessage('2')
    const message3 = createMessage('3')
    timerutil([timer1], message1, task)
    t.is(store.TIMERS.get(message1).length, 1)
    timerutil([timer1], message1, task)
    t.is(store.TIMERS.get(message1).length, 2)
    timerutil([timer1], message2, task)
    t.is(store.TIMERS.get(message2).length, 1)
    timerutil([timer1], message2, task)
    t.is(store.TIMERS.get(message2).length, 2)
    timerutil([timer1], message3, task)
    t.is(store.TIMERS.get(message3).length, 1)
    // clear id-1's list
    timerutil([], message1, task)
    t.is(store.TIMERS.get(message1).length, 0)
    t.is(store.TIMERS.get(message2).length, 2)
    t.is(store.TIMERS.get(message3).length, 1)
})

test('timer util with sound', t => {
    const timerutil = require('./util/timer.js')
    const tasks = [
        () => {
            // dummy function
        },
        () => {
            // dummy function
        },
    ]
    const voice = (s) => {t.is(s, '')}
    const timer = { message: 'test-message', time: 0, sound: 'test-sound' }
    const message = createMessage('dummy')
    timerutil([timer], message, tasks)
    t.is(store.TIMERS.get(message).length, 1)
    timerutil([timer], message, tasks, voice)
    t.is(store.TIMERS.get(message).length, 2)
})

function setupClient(checker, isConnection, memberNumber) {
    const botId = Discord.SnowflakeUtil.generate()
    const client = createClient(botId)
    const members = new Map().set(botId, '')
    for (let i = 0; i < memberNumber; i++) {
        members.set(Discord.SnowflakeUtil.generate(), '')
    }
    const connections = new Map()
    if (isConnection) {
        connections.set(Discord.SnowflakeUtil.generate(), { channel: { id: Discord.SnowflakeUtil.generate(), members: members, leave: checker } })
    }
    client.voice.connections = connections
    return client
}

test('auto leving from vc when bot becomes alone', t => {
    const watcher = require('./module/watch_vc_state.js')
    let calledFnLeave = false
    const checker = () => { calledFnLeave = true }
    const client = setupClient(checker, true, 0)
    watcher.exec(client)
    t.truthy(calledFnLeave)
    // error cases: no connections
    const clientNoConnections = setupClient(checker, false, 5)
    calledFnLeave = false
    watcher.exec(clientNoConnections)
    t.falsy(calledFnLeave)
    // error cases: not alone
    const clientWithOtherMember = setupClient(checker, true, 1)
    calledFnLeave = false
    watcher.exec(clientWithOtherMember)
    t.falsy(calledFnLeave)
})

test('buttons', t => {
    const buttons = require('./util/button.js')
    t.is(buttons.buttons.get('mob-start'), startBtn)
    t.is(buttons.buttons.get('mob-cancel'), cancelBtn)
    t.is(buttons.buttons.get('mob-ready'), readyBtn)
    t.is(buttons.buttons.size, 3)
    t.is(buttons.reply({ id: 'mob-start' }), '!mob start')
    t.is(buttons.reply({ id: 'mob-cancel' }), '!mob cancel')
    t.is(buttons.reply({ id: 'dummy' }), null)
})

test('task factory message', t => {
    const taskFactory = require('./util/task.js')
    const message = createMessage('dummy')
    let sendMessage
    let sendComponent
    message.channel.send = (m, c) => {
        sendMessage = m
        sendComponent = c
    }
    const tasks = taskFactory(message)
    const text = Discord.SnowflakeUtil.generate()
    tasks.get('message')({ message: text })
    t.is(sendMessage, text)
    t.is(sendComponent, null)
    tasks.get('message')({ message: text, component: startBtn })
    t.is(sendMessage, text)
    t.is(sendComponent, startBtn)
})

test('task factory sound', async t => {
    const taskFactory = require('./util/task.js')
    let played = ''
    const message = createMessage('dummy')
    message.member.voice.channel.join =
        () => { return { play: (f) => { played = f} }}
    const tasks = taskFactory(message)
    const file = 'test.mp3'
    await tasks.get('sound')(file)
    t.is(played, file)
})

test('task factory progress', async t => {
    const taskFactory = require('./util/task.js')
    const message = createMessage('dummy')
    const tasks = taskFactory(message)
    await tasks.get('progress')('*****')
    t.is(store.TIMERS.get(message).length, 1)
    t.is(store.TIMERS.get(message)[0]._repeat, 10000)
})

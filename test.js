const test = require('ava')
const Discord = require('discord.js')
const mob = require('./module/mob.js')

function createMessageChain(message, text, names = []) {
    return createMessage(text, names, message.member.voice.channel.id)
}

function createMessage(text, names = [], id = Discord.SnowflakeUtil.generate()) {
    const members = new Map()
    names.forEach((name)=> {
        members.set(Discord.SnowflakeUtil.generate(), createMember(name))
    })
    return { content:text, member: { voice: { channel: {
        id: id,
        members: members,
        join: (()=>{ return { play: (file) => { console.log(file) } } }),
    } } } }
}

function createMember(name, id = Discord.SnowflakeUtil.generate()) {
    return { user:{ id: id, username: name } }
}

test('ping pong', t => {
    const ping = require('./module/ping.js')
    const message = createMessage('!ping')
    const ret = ping.exec(message)
    t.is(ret.msg, 'Pong.')
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
    t.is((await mob.exec(message)).msg, exp)
})

test('mob ready (not joining voice chat)', async t => {
    const message = { content:'!mob ready', member: { voice: { channel: null } } }
    t.is((await mob.exec(message)).msg, ':robot: voice チャンネルにjoinしてください')
})

test('mob ready (user is alone)', async t => {
    const message = createMessage('!mob ready', ['aaa'])
    t.is((await mob.exec(message)).msg, ':robot: ぼっちなのでモブ出来ません')
})

test('mob start initialization', async t => {
    const message = createMessage('!mob start')
    const ret = await mob.exec(message)
    t.is(ret.msg, ':robot: `!mob ready` を先に実行してください')
    t.is(ret.timers, undefined)
})

test('mob ready', async t => {
    const message = createMessage('!mob ready', ['aaa', 'bbb', 'ccc'])
    const ret = await mob.exec(message)
    t.is(ret.msg, ':robot: メンバーは aaa bbb ccc ')
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
    t.regex(ret.msg, /:robot: シャッフルしまーす\n... ... ... \ndriver => ..., navigator => .../)
    t.is(ret.timers.length, 3)
    t.like(ret.timers[0], {
        time: 5 * 60,
        sound: './assets/ada_well_done.mp3',
    })
    t.regex(ret.timers[0].message, /:robot: 5分たちました! <@[0-9].+> <@[0-9].+> <@[0-9].+> \n:robot: 次の driver は ... ,navigator は .../)
    t.like(ret.timers[1], {
        time: 4 * 60,
        sound: undefined,
    })
    t.is(ret.timers[1].message, ':robot: 後1分！！！！！！')
    t.is(ret.timers[2].progress, '*'.repeat(5 * 6))
    // continue
    t.is((await mob.exec(message)).msg, ':robot: はじまるよー！')
    t.is((await mob.exec(message)).msg, ':robot: はじまるよー！')
    t.is((await mob.exec(message)).msg, ':robot: はじまるよー！')
})

test('mob start with number', async t => {
    // ready
    const message = createMessage('!mob ready', ['aaa', 'bbb', 'ccc'])
    t.is((await mob.exec(message)).msg, ':robot: メンバーは aaa bbb ccc ')
    // start
    const message2 = createMessageChain(message, '!mob start 4')
    const ret = await mob.exec(message2)
    t.is(ret.timers.length, 3)
    t.like(ret.timers[0], {
        time: 240,
        sound: './assets/ada_well_done.mp3',
    })
    t.regex(ret.timers[0].message, /:robot: 4分たちました! <@[0-9].+> <@[0-9].+> <@[0-9].+> \n:robot: 次の driver は ... ,navigator は .../)
    t.like(ret.timers[1], {
        time: 180,
        sound: undefined,
    })
    t.is(ret.timers[1].message, ':robot: 後1分！！！！！！')
    t.is(ret.timers[2].progress, '*'.repeat(4 * 6))
    const message3 = createMessageChain(message, '!mob start 2')
    t.is((await mob.exec(message3)).timers[0].time, 2 * 60)
    const message4 = createMessageChain(message, '!mob start 1')
    t.is((await mob.exec(message4)).timers, undefined)
    t.is((await mob.exec(message4)).msg, ':robot: 入力値は2以上、30以下です。')
    const message5 = createMessageChain(message, '!mob start 30')
    t.is((await mob.exec(message5)).timers[0].time, 30 * 60)
    const message6 = createMessageChain(message, '!mob start 31')
    t.is((await mob.exec(message6)).timers, undefined)
    t.is((await mob.exec(message6)).msg, ':robot: 入力値は2以上、30以下です。')
    const message7 = createMessageChain(message, '!mob start aaa')
    t.is((await mob.exec(message7)).timers, undefined)
    t.is((await mob.exec(message7)).msg, ':robot: 入力値は2以上、30以下です。')
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
    t.regex(ret.msg, /:robot: はいよ！\n次の driver は ... ,navigator は .../)
    t.is(ret.timers.length, 0)
})

test('factory no command', t => {
    const factory = require('./module/factory.js')
    const message = createMessage('ping')
    t.is(factory(message.content), undefined)
})

test('factory', t => {
    const factory = require('./module/factory.js')
    let message = createMessage('!ping')
    t.is(factory(message.content).id, 'ping')
    message = createMessage('!mob')
    t.is(factory(message.content).id, 'mob')
    message = createMessage('!syuzo')
    t.is(factory(message.content).id, 'syuzo')
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
    timerutil([timer1], '1', task)
    t.is(timerutil.list().size, 1)
    timerutil([timer1], '1', task)
    t.is(timerutil.list().size, 1)
    timerutil([timer1], '2', task)
    t.is(timerutil.list().size, 2)
    timerutil([timer1], '2', task)
    t.is(timerutil.list().size, 2)
    timerutil([timer1], '3', task)
    t.is(timerutil.list().size, 3)
    // timer list check
    t.is(timerutil.list().get('1').length, 2)
    // clear id-1's list
    timerutil([], '1', task)
    t.is(timerutil.list().get('1').length, 0)
    t.is(timerutil.list().get('2').length, 2)
    t.is(timerutil.list().get('3').length, 1)
})

test('timer util with sound', t => {
    const timerutil = require('./util/timer.js')
    const task = [
        () => {
            // dummy function
        },
        () => {
            // dummy function
        },
    ]
    const voice = (s) => {t.is(s, '')}
    const timer = { message: 'test-message', time: 0, sound: 'test-sound' }
    timerutil([timer], '1', task)
    t.is(timerutil.list().get('1').length, 1)
    timerutil([timer], '1', task, voice)
    t.is(timerutil.list().get('1').length, 2)
})

function setupClient(checker, isConnection, memberNumber) {
    const botId = Discord.SnowflakeUtil.generate()
    const members = new Map().set(botId, '')
    for (let i = 0; i < memberNumber; i++) {
        members.set(Discord.SnowflakeUtil.generate(), '')
    }
    const connections = new Map()
    if (isConnection) {
        connections.set(Discord.SnowflakeUtil.generate(), { channel: { members: members, leave: checker } })
    }
    return { user: { id: botId }, voice: { connections: connections } }
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

const test = require('ava')
const Discord = require('discord.js');
const mob = require('./module/mob.js')

function createMessage(text, names=[]){
    const members = new Map()
    names.forEach((name)=> {
        members.set(Discord.SnowflakeUtil.generate(), createMember(name))
    })
    return { content:text, member: { voice: { channel: { 
        members: members, 
        join: (()=>{ return {play: (file) => {console.log(file)}}})
    }}}}
}

function createMember(name, id=Discord.SnowflakeUtil.generate()){
    return { user:{id: id, username: name} }
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
    t.is(ret.timers[1].time, 60)
})
test('syuzo stop', t => {
    const message = createMessage('!syuzo stop')
    const syuzo = require('./module/syuzo.js')
    const ret = syuzo.exec(message)
    t.is(ret.timers.length, 0)
})

test('mob help', async t => {
    let message = createMessage('!mob help')
    const exp = ':robot: まず `ready` を使ってね。`start`で開始だよ。後はずっと`start`を使ってね。\n途中でとめたきゃ`cancel`'
    t.is((await mob.exec(message)).msg, exp)
})

test('mob ready (not joining voice chat)', async t => {
    let message = { content:'!mob ready', member: { voice: {channel: null}}}
    t.is((await mob.exec(message)).msg, ':robot: voice チャンネルにjoinしてください')
})

test('mob ready (user is alone)', async t => {
    let message = createMessage('!mob ready', ['aaa'])
    t.is((await mob.exec(message)).msg, ':robot: ぼっちなのでモブ出来ません')
})

test('mob ready', async t => {
    let message = createMessage('!mob ready', ['aaa', 'bbb', 'ccc'])
    t.is((await mob.exec(message)).msg, ':robot: メンバーは aaa bbb ccc ')
})

test('mob start', async t => {
    // ready
    let message = createMessage('!mob ready', ['aaa', 'bbb', 'ccc'])
    t.is((await mob.exec(message)).msg, ':robot: メンバーは aaa bbb ccc ')
    // start
    message = createMessage('!mob start')
    const ret = await mob.exec(message)
    const splited = ret.msg.split('\n')
    t.is(splited[0], ':robot: シャッフルしまーす')
    t.regex(splited[1], /... ... .../)
    t.regex(splited[2], /driver => ..., navigator => .../)
    t.is(ret.timers.length, 2)
    t.is(ret.timers[0].time, 5)
    t.is(ret.timers[1].time, 4)
    const timer_message = ret.timers[0].message.split('\n')
    t.regex(timer_message[0], /:robot: 5分たちました! <@[0-9].+> <@[0-9].+> <@[0-9].+>/)
    t.regex(timer_message[1], /:robot: 次の driver は ... ,navigator は .../)
    t.is(ret.timers[1].message, ':robot: 後1分！！！！！！')
    // continue
    t.is((await mob.exec(message)).msg, ':robot: はじまるよー！')
    t.is((await mob.exec(message)).msg, ':robot: はじまるよー！')
    t.is((await mob.exec(message)).msg, ':robot: はじまるよー！')
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
    const task = () => {}
    const timer1 = { message: 'test-message' , time: 0 }
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

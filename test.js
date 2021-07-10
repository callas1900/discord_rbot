const test = require('ava')
const Discord = require('discord.js');
const mob = require('./module/mob.js')

function createMessage(text, data=null){
    return { content:text, member: {voice: {channel: data}} }
}
function createMember(name, id=Discord.SnowflakeUtil.generate()){
    return { user:{id: id, username: name} }
}

test('ping pong', t => {
    const target = require('./module/ping.js')
    t.is(target('!ping'), 'Pong.')
})

test('mob help', t => {
    let message = createMessage('!mob help')
    const exp = ':robot: まず `ready` を使ってね。`start`で開始だよ。後はずっとstartを使ってね。'
    t.is(mob(message).msg, exp)
})

test('mob ready (not joining voice chat)', t => {
    let message = createMessage('!mob ready')
    const exp = ':robot: voice チャンネルにjoinしてください'
    t.is(mob(message).msg, exp)
})

test('mob ready (user is alone)', t => {
    const members = new Map()
    members.set('aaaa', createMember('aaa'))
    let message = createMessage('!mob ready', {members: members})
    const exp = ':robot: ぼっちなのでモブ出来ません'
    t.is(mob(message).msg, exp)
})

test('mob ready', t => {
    let message = createMessage('!mob ready', {members: [
        createMember('aaa'), createMember('bbb'), createMember('ccc')]})
    t.is(mob(message).msg, ':robot: メンバーは aaa bbb ccc ')
})
test('mob start', t => {
    // ready
    let message = createMessage('!mob ready', {members: [
        createMember('aaa'), createMember('bbb'), createMember('ccc')]})
    mob(message)
    // start
    message = createMessage('!mob start')
    const ret = mob(message)
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
    t.is(mob(message).msg, ':robot: はじまるよー！')
    t.is(mob(message).msg, ':robot: はじまるよー！')
    t.is(mob(message).msg, ':robot: はじまるよー！')
})


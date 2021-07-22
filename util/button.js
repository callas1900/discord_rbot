const { MessageButton } = require('discord-buttons')
const startId = 'mob-start'
const cancelId = 'mob-cancel'
const readyId = 'mob-ready'
module.exports.buttons = new Map()
    .set(startId, new MessageButton()
        .setStyle('green')
        .setLabel('start')
        .setID(startId))
    .set(cancelId, new MessageButton()
        .setStyle('red')
        .setLabel('cancel')
        .setID(cancelId))
    .set(readyId, new MessageButton()
        .setStyle('blurple')
        .setLabel('ready')
        .setID(readyId))
module.exports.reply = function(button) {
    let message
    switch (button.id) {
    case startId:
        message = '!mob start'
        break
    case cancelId:
        message = '!mob cancel'
        break
    case readyId:
        message = `!mob ready ${button.clicker.id}`
        break
    default:
        message = null
    }
    return message
}

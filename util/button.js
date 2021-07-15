const { MessageButton } = require('discord-buttons')
const startId = 'mob-start'
const cancelId = 'mob-cancel'
module.exports.buttons = new Map()
    .set(startId, new MessageButton()
        .setStyle('green')
        .setLabel('continue')
        .setID(startId))
    .set(cancelId, new MessageButton()
        .setStyle('red')
        .setLabel('cancel')
        .setID(cancelId))
module.exports.reply = function(button) {
    let message
    switch (button.id) {
    case startId:
        message = '!mob start'
        break
    case cancelId:
        message = '!mob cancel'
        break
    }
    return message
}

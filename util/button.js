const { MessageButton } = require('discord-buttons')
const startId = 'mob-start'
module.exports.buttons = new Map()
    .set(startId, new MessageButton()
        .setStyle('green')
        .setLabel('continue')
        .setID(startId))
module.exports.reply = function(button) {
    let message
    switch (button.id) {
    case startId:
        message = '!mob start'
        break
    }
    return message
}

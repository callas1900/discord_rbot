module.exports.exec = function(message) { 
    console.log(message.content)
    return {msg: 'Pong.'}
}


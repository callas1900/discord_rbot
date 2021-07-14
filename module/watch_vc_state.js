module.exports.exec = function(client) {
    if (client.voice.connections.size < 1) { return }
    const vc = client.voice.connections.values().next().value.channel
    if (vc.members.size < 2 && vc.members.keys().next().value === client.user.id) {
        console.log('leave channel')
        vc.leave()
    }
}


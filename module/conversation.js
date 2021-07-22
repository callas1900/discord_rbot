const kuromoji = require('kuromoji')
const buttonutil = require('../util/button.js')
const readyBtn = buttonutil.buttons.get('mob-ready')

async function analyze(content) {
    const builder = kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' })
    const tokenizer = await new Promise(resolve => {
        builder.build((err, _tokenizer) => {
            resolve(_tokenizer)
        })
    })
    return tokenizer.tokenize(content)
}

module.exports.exec = async message => {
    let text = 'なんすか？'
    let component = null

    const content = message.content.split(/<@!.*>/).join(' ')
    const path = await analyze(content)
    const nouns = []
    path.filter(w => w.pos === '名詞').forEach((w) => {
        nouns.push(w.surface_form)
    })

    if (nouns.includes('モブ') || nouns.includes('mob')) {
        text = ':robot: モブセッションしたいの？ `!mob ready` コマンドすら覚えられないの？ ボタン押してー'
        component = readyBtn
    }
    return { msg: { message: text, component: component } }
}


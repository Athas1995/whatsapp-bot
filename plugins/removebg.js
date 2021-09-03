/* Copyright (C) 2020 Yusuf Usta.

Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.

WhatsAsena - Yusuf Usta
*/

const Asena = require('../Utilis/events');
const { MessageType, Mimetype } = require('@adiwajshing/baileys');
const Language = require('../language');
const config = require('../config');
const { removeBg } = require('../Utilis/download');
const Lang = Language.getString('removebg');
let fm = true

Asena.addCommand({ pattern: 'removebg', fromMe: fm, desc: Lang.REMOVEBG_DESC }, (async (message, match) => {
    if (config.REMOVEBG == "false") return await message.sendMessage("```Set Your remove.bg key in HEROKU```")
    let location = await message.reply_message.downloadMediaMessage();
    let buffer = await removeBg(location, config.REMOVEBG);
    if (typeof buffer == 'string') {
        if (buffer.includes('403')) return await message.sendMessage('*Wrong key.*');
        else if (buffer.includes('402')) return await message.sendMessage('*free limit exhausted.Pls wait for renew or set new key.*');
        else return await message.sendMessage(buffer);
    }
    return await message.sendMessage(buffer, { quoted: message.quoted, mimetype: Mimetype.png }, MessageType.image)
}));
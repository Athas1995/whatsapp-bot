const { MessageType, Mimetype } = require("@adiwajshing/baileys");
const Asena = require("../Utilis/events");
// const config = require('../config');
const moment = require("moment");
const {
  getName,
  getBuffer,
  getJson,
  IdentifySong,
} = require("../Utilis/download");
const { emoji } = require("../Utilis/Misc");
const { audioCut } = require("../Utilis/fFmpeg");

Asena.addCommand(
  { pattern: "whois ?(.*)", fromMe: true, desc: "Show Group or person info." },
  async (message, match) => {
    if (message.isGroup && !message.reply_message) {
      let pp;
      try {
        pp = await message.client.getProfilePicture(message.jid);
      } catch (error) {
        pp =
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
      }
      let group = await message.client.groupMetadata(message.jid);
      let msg =
        "```" +
        `Name    : ${group.subject}
Id      :  ${group.id}
Onwer   : wa.me/${parseInt(group.owner)}
Created : ${moment.unix(group.creation).format("MMMM Do YYYY, h:mm a")}
Desc    : ${group.desc}` +
        "```";
      let buffer = await getBuffer(pp);
      return await message.sendMessage(
        buffer,
        { caption: msg },
        MessageType.image
      );
    } else if (message.isGroup && message.reply_message !== false) {
      let status = await message.client.getStatus(message.reply_message.jid);
      let pp;
      try {
        pp = await message.client.getProfilePicture(message.reply_message.jid);
      } catch (error) {
        pp =
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
      }
      let msg =
        "```" +
        `Name   : ${await getName(message.reply_message.jid, message.client)}
Id     : ${message.reply_message.jid}
Status : ${status.status}` +
        "```";
      let buffer = await getBuffer(pp);
      return await message.sendMessage(
        buffer,
        { caption: msg },
        MessageType.image
      );
    } else {
      let status = await message.client.getStatus(message.jid);
      let pp;
      try {
        pp = await message.client.getProfilePicture(message.jid);
      } catch (error) {
        pp =
          "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
      }
      let msg =
        "```" +
        `Name   : ${await getName(message.jid, message.client)}
Id     : ${message.reply_message.jid}
Status : ${status.status}`;
      let buffer = await getBuffer(pp);
      await message.sendMessage(buffer, { caption: msg }, MessageType.image);
    }
  }
);

Asena.addCommand(
  { pattern: "upload ?(.*)", fromMe: true, desc: "Download from link." },
  async (message, match) => {
    match = match == "" ? message.reply_message.text : match;
    if (match === "")
      return await message.sendMessage("```Give me a direct download link.```");
    await message.sendMessage("```Downloading file...```");
    let { buffer, type, name, emessage, mime } = await getBuffer(match);
    if (!buffer) return await message.sendMessage(emessage);
    if (type == "video")
      return await message.sendMessage(
        buffer,
        { filename: name, mimetype: mime },
        MessageType.video
      );
    else if (type == "image")
      return await message.sendMessage(
        buffer,
        { filename: name, mimetype: mime },
        MessageType.image
      );
    else if (type == "audio")
      return await message.sendMessage(
        buffer,
        { filename: name, mimetype: mime },
        MessageType.audio
      );
    else
      return await message.sendMessage(
        buffer,
        { filename: name, mimetype: mime },
        MessageType.document
      );
  }
);

Asena.addCommand(
  { pattern: "scl ?(.*)", fromMe: true, desc: "Download song SoundCloud." },
  async (message, match) => {
    match = match == "" ? message.reply_message.text : match;
    if (match === "") return await message.sendMessage("```Give me a Link.```");
    if (!match.startsWith("https://"))
      return await message.sendMessage("*Give me a link.*");
    let sc = "https://soundcloud.com" + match.split(".com")[1];
    let url = `https://api.zeks.xyz/api/soundcloud?apikey=bottus000000&url=${sc}`;
    const json = await getJson(url);
    if (json.status !== true)
      return await message.sendMessage("```Invalid Link.```");
    let title = json.result.title;
    let { buffer, mime } = await getBuffer(json.result.download);
    await message.sendMessage(
      buffer,
      { filename: title, mimetype: mime, ptt: false },
      MessageType.audio
    );
  }
);

Asena.addCommand(
  { pattern: "emoji ?(.*)", fromMe: true, desc: "Convert emoji to sticker." },
  async (message, match) => {
    match = match == "" ? message.reply_message.text : match;
    if (match === "") return await message.sendMessage("*Give me a emoji.*");
    let buffer = await emoji(match);
    if (buffer !== false)
      return await message.sendMessage(
        buffer,
        { quoted: message.quoted, mimetype: Mimetype.webp },
        MessageType.sticker
      );
  }
);

Asena.addCommand(
  { pattern: "ss ?(.*)", fromMe: true, desc: "Take web screenshot." },
  async (message, match) => {
    match = match == "" ? message.reply_message.text : match;
    let url = `https://shot.screenshotapi.net/screenshot?&url=${match}
	&width=1388&height=720&output=image&file_type=png&block_ads=true&no_cookie_banners=true&dark_mode=true&wait_for_event=networkidle`;
    let { buffer } = await getBuffer(url);
    await message.sendMessage(
      buffer,
      { quoted: message.quoted },
      MessageType.image
    );
  }
);

Asena.addCommand(
  { pattern: "find", fromMe: true, desc: "Identify song." },
  async (message, match) => {
    if (
      !message.reply_message ||
      (!message.reply_message.audio && !message.reply_message.video)
    )
      return await message.sendMessage("*Reply to a audio.*");
    let location = await message.reply_message.downloadAndSaveMediaMessage(
      "find"
    );
    let buff = await audioCut(location, 0, 15, "findo");
    const data = await IdentifySong(buff);
    if (!data) return;
    if (!data.status) return await message.sendMessage("*Not Found*");
    let result =
      "```" +
      `Title    : ${data.data.title}\nArtists  : ${data.data.artists}
Genre    : ${data.data.genre}\nAlbum    : ${data.data.album}\nReleased : ${data.data.release_date}` +
      "```";
    return await message.sendMessage(result, { quoted: message.quoted });
  }
);

Asena.addCommand(
  { pattern: "attp ?(.*)", fromMe: true, desc: "Text to sticker" },
  async (message, match) => {
    if (match === "") return await message.sendMessage("*Give me some words.*");
    let { buffer } = await getBuffer(
      `https://api.xteam.xyz/attp?file&text=${encodeURIComponent(match)}`
    );
    if (!buffer)
      await message.sendMessage(
        buffer,
        { mimetype: Mimetype.webp },
        MessageType.sticker
      );
  }
);

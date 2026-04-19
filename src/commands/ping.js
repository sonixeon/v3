module.exports.config = {
 name: "ping",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "Sagor + ChatGPT",
 description: "Check bot latency",
 commandCategory: "System",
 usages: "",
 cooldowns: 5,
 aliases: ["p", "pong"] // 👈 alias added here
};

module.exports.run = async function ({ api, event }) {
 const start = Date.now();

 return api.sendMessage("🏓 Pinging...", event.threadID, (err, info) => {
 const end = Date.now();
 const ping = end - start;

 api.editMessage(`🏓 Pong!\n⏱️ Ping: ${ping}ms`, info.messageID);
 }, event.messageID);
};
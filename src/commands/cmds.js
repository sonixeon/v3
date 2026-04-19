const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const vm = require("vm");

if (!global.client.handleReaction) global.client.handleReaction = [];

module.exports.config = {
  name: "cmd",
  version: "4.0.0",
  hasPermssion: 2,
  credits: "SaGor + Fix",
  description: "Advanced Command Manager",
  commandCategory: "System",
  usages: "[load/unload/loadAll/unloadAll/install/del/info/count]",
  cooldowns: 3
};

function box(title, content) {
  return (
`┌─❖
│ ${title}
├─•
${content}
└─❖`
  );
}

// 🔥 REGISTER COMMAND + ALIAS
function registerCommand(command) {
  global.client.commands.set(command.config.name, command);

  const aliases = command.config.aliases;
  if (Array.isArray(aliases)) {
    for (const a of aliases) {
      global.client.commands.set(a.toLowerCase(), command);
    }
  } else if (typeof aliases === "string") {
    global.client.commands.set(aliases.toLowerCase(), command);
  }
}

// 🔥 REMOVE COMMAND + ALIAS
function removeCommand(name) {
  const cmd = global.client.commands.get(name);
  if (!cmd) return;

  global.client.commands.delete(cmd.config.name);

  const aliases = cmd.config.aliases;
  if (Array.isArray(aliases)) {
    for (const a of aliases) {
      global.client.commands.delete(a.toLowerCase());
    }
  } else if (typeof aliases === "string") {
    global.client.commands.delete(aliases.toLowerCase());
  }
}

module.exports.run = async function ({ api, event, args }) {

  const { threadID, messageID } = event;
  const commandFolder = __dirname;

  if (!args[0]) {
    return api.sendMessage(box(
      "📦 CMD MANAGER",
`│ cmd load <name>
│ cmd unload <name>
│ cmd loadAll
│ cmd unloadAll
│ cmd install <file.js> <url/code>
│ cmd del <name>
│ cmd info <name>
│ cmd count`
    ), threadID, messageID);
  }

  const action = args[0].toLowerCase();

  try {

    // COUNT
    if (action === "count") {
      return api.sendMessage(box(
        "📊 TOTAL COMMANDS",
        `│ ${global.client.commands.size} loaded`
      ), threadID, messageID);
    }

    // INFO
    if (action === "info") {
      const name = args[1];
      const cmd = global.client.commands.get(name);

      if (!cmd)
        return api.sendMessage(box("❌ ERROR", "│ Command not found"), threadID, messageID);

      const c = cmd.config;

      return api.sendMessage(box(
        "📄 COMMAND INFO",
`│ Name: ${c.name}
│ Version: ${c.version}
│ Author: ${c.credits}
│ Permission: ${c.hasPermssion}
│ Cooldown: ${c.cooldowns}
│ Category: ${c.commandCategory}`
      ), threadID, messageID);
    }

    // LOAD
    if (action === "load") {
      const name = args[1];
      if (!name) return api.sendMessage(box("❌ ERROR", "│ Missing name"), threadID, messageID);

      const file = path.join(commandFolder, name + ".js");

      try {
        delete require.cache[require.resolve(file)];
        const command = require(file);

        if (!command.config || !command.config.name)
          return api.sendMessage(box("❌ INVALID", "│ Missing config.name"), threadID, messageID);

        registerCommand(command);

        return api.sendMessage(box("✅ LOAD SUCCESS", `│ ${name} loaded`), threadID, messageID);

      } catch (e) {
        return api.sendMessage(box("❌ LOAD ERROR", `│ ${e.message}`), threadID, messageID);
      }
    }

    // UNLOAD
    if (action === "unload") {
      const name = args[1];
      if (!name) return api.sendMessage(box("❌ ERROR", "│ Missing name"), threadID, messageID);

      removeCommand(name);

      return api.sendMessage(box("✅ UNLOAD", `│ ${name} removed`), threadID, messageID);
    }

    // LOAD ALL
    if (action === "loadall") {
      const files = fs.readdirSync(commandFolder).filter(f => f.endsWith(".js"));
      let count = 0;

      for (const file of files) {
        try {
          const dir = path.join(commandFolder, file);
          delete require.cache[require.resolve(dir)];
          const cmd = require(dir);

          if (cmd.config?.name) {
            registerCommand(cmd);
            count++;
          }
        } catch {}
      }

      return api.sendMessage(box("✅ LOAD ALL", `│ Loaded: ${count}`), threadID, messageID);
    }

    // UNLOAD ALL
    if (action === "unloadall") {
      global.client.commands.clear();
      return api.sendMessage(box("✅ UNLOAD ALL", "│ All commands removed"), threadID, messageID);
    }

    // DELETE
    if (action === "del") {
      const name = args[1];
      const file = path.join(commandFolder, name + ".js");

      if (!fs.existsSync(file))
        return api.sendMessage(box("❌ ERROR", "│ File not found"), threadID, messageID);

      fs.unlinkSync(file);
      removeCommand(name);

      return api.sendMessage(box("🗑️ DELETED", `│ ${name}.js removed`), threadID, messageID);
    }

    // INSTALL
    if (action === "install") {

      const fileName = args[1];
      const input = args.slice(2).join(" ");

      if (!fileName || !input)
        return api.sendMessage(box("❌ ERROR", "│ cmd install file.js <url/code>"), threadID, messageID);

      let code;

      if (input.startsWith("http")) {
        const res = await axios.get(input);
        code = res.data;
      } else {
        code = input;
      }

      try {
        new vm.Script(code);
      } catch (e) {
        return api.sendMessage(box("❌ SYNTAX ERROR", `│ ${e.message}`), threadID, messageID);
      }

      const filePath = path.join(commandFolder, fileName);

      fs.writeFileSync(filePath, code);

      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);

      if (!command.config?.name)
        return api.sendMessage(box("❌ INVALID", "│ Missing config.name"), threadID, messageID);

      registerCommand(command);

      return api.sendMessage(box("✅ INSTALLED", `│ ${fileName} active`), threadID, messageID);
    }

  } catch (err) {
    return api.sendMessage(box("❌ ERROR", `│ ${err.message}`), threadID, messageID);
  }
};

// 🔥 REACTION OVERWRITE
module.exports.handleReaction = async function ({ api, event, handleReaction }) {

  const { author, fileName, code, path } = handleReaction;

  if (event.userID != author) return;

  try {
    fs.writeFileSync(path, code);

    delete require.cache[require.resolve(path)];
    const command = require(path);

    registerCommand(command);

    return api.sendMessage(
`┌─❖
│ ✅ OVERWRITE DONE
├─•
│ ${fileName} updated
└─❖`,
      event.threadID
    );

  } catch (e) {
    return api.sendMessage("❌ Error: " + e.message, event.threadID);
  }
};
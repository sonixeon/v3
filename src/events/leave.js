module.exports.config = {
	name: "leave",
	eventType: ["log:unsubscribe"],
	version: "1.0.0",
	credits: "SaGor",
	description: "left notification",
	dependencies: {
		"fs-extra": "",
		"path": "",
		"request": ""
	}
};

module.exports.run = async function({ api, event, Users, Threads }) {
	if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

	const fs = global.nodemodule["fs-extra"];
	const { createReadStream, existsSync, mkdirSync } = fs;
	const { join } = global.nodemodule["path"];
	const request = global.nodemodule["request"];
	const { threadID } = event;

	// Ensure cache directory exists
	const cacheDir = join(__dirname, "cache");
	if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

	const data =
		global.data.threadData.get(parseInt(threadID)) ||
		(await Threads.getData(threadID)).data;

	const name =
		global.data.userName.get(event.logMessageData.leftParticipantFbId) ||
		(await Users.getNameUser(event.logMessageData.leftParticipantFbId));

	const type =
		event.author == event.logMessageData.leftParticipantFbId
			? " "
			: "\n\nKicked by Administrator";

	let msg =
		typeof data.customLeave == "undefined"
			? "Goodbye {name} {type}"
			: data.customLeave;

	msg = msg
		.replace(/\{name}/g, name)
		.replace(/\{type}/g, type);

	const link = [
		"https://i.imgur.com/U2Uqx9J.jpg",
		"https://i.imgur.com/vtg9SY8.jpg",
		"https://i.imgur.com/FTM9eHt.jpg",
		"https://i.imgur.com/VGb89J8.jpg"
	];

	const filePath = join(cacheDir, "leiamnashO.jpg");

	const callback = () =>
		api.sendMessage(
			{
				body: msg,
				attachment: createReadStream(filePath)
			},
			threadID,
			() => fs.unlinkSync(filePath)
		);

	return request(
		encodeURI(link[Math.floor(Math.random() * link.length)])
	)
		.pipe(fs.createWriteStream(filePath))
		.on("close", callback);
};

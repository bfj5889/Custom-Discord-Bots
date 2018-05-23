const Discord = require('discord.js');
const auth = require('./auth.json');
const help = require('./help.json');
const $ = require('jquery');

const client = new Discord.Client();
let hydrationMap = new Map();
let timerList = [];


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
	try {
		// It will listen for messages that will start with `*`
		if (msg.content.substring(0, 1) === '$') {
			let content = msg.content;
			let request = content.substring(1).split(' ');
			let cmd = request[0];
			let args = request.splice(1);
			
			switch (cmd) {
				// *ping
				case 'ping':
					msg.reply('pong');
					break;
				
				case 'whoAThot':
					msg.reply('You a thot');
					break;
				
				case 'help':
					let helpMsg = performHelp(args);
					msg.reply(helpMsg);
					break;
				
				case 'startHydration':
					let startMsg = startHydration(msg.author, args);
					msg.author.send(startMsg);

                case 'stopHydration':
                    let stopMsg = stopHydration(msg.author);
                    msg.author.send(stopMsg);
			}
		}
	} catch (err) {
		msg.reply("Sorry ThotBot could not process that command. RIP \nHere is the error ya thot: \n" + err + "\n And here is the stack: \n" + err.stack);
	}
});

client.login(auth.token);

/**** Helper Functions ****/
function startHydration(msgAuthor, args) {
	//TODO: compare string to number,
	//TODO: check for possible coercion and add try catch for Discord API promise issues
    //reinstall node on home cpu to see error

    if (args[0] !== undefined) {
		if (args[0] == parseInt(args[0])) {
			let userHydrationData = {
				"interval": parseInt(args[0]),
				"id": msgAuthor.id
			};
			hydrationMap.set(msgAuthor.id, userHydrationData);
			createTimer(msgAuthor);
			
			return "Hydration reminder set for " + args[0] + " minutes. Happy hydration!";
		} else {
			return "Error: ThotBot expected a number of minutes to start hydration with, but none were given. See `*help startHydration` for a command description.";
		}
	} else {
		if (hydrationMap.has(msgAuthor)) {
			let userHydrationData = hydrationMap.get(msgAuthor);
			let intervalTime = userHydrationData['interval'];
			
			return "Hydration reminder set for " + intervalTime + " minutes. Happy hydration!";
		} else {
			return "Error: ThotBot can not find a previous hydration entry for your Discord account. Run the command again with a time interval. See `*help startHydration` for a command description.";
		}
	}
}


function createTimer(msgAuthor) {
	let interval = setInterval(function () {
		client.fetchUser(msgAuthor.id).then(user => {
			user.send("Drink some water you thot!");
			console.log("Sent " + msgAuthor.username + " a message. With her " + hydrationMap.get(msgAuthor.id)['interval'] + " interval");
		})
	}, ((parseInt(hydrationMap.get(msgAuthor.id)['interval']) * 60000)));
	let hydrationData = {
        "interval": parseInt(hydrationMap.get(msgAuthor.id)['interval']),
        "id": msgAuthor.id,
		"timer" : interval
    };
	console.log("The timer object: " + interval);
	console.log("HydrationData : " + hydrationData['timer']);
	hydrationMap.set(msgAuthor.id, hydrationData);
}

function stopHydration(msgAuthor){
    let timerID = hydrationMap.get(msgAuthor.id);
    console.log("The timer id: " + timerID);
    if (timerID !== undefined) {
        clearInterval(timerID);
        //hydrationMap.delete(msgAuthor.id);
        return "Hydration reminder cancelled.";
    } else {
        return "Error: No hydration reminder timer found."
    }
}


function performHelp(args) {
	if (args.length === 0) {
		return help.commands;
	} else if (args.length === 1) {
		if (args[0] === "startHydration") {
			return help.startHydration;
		} else if (args[0] === "stopHydration") {
			return help.stopHydration;
		} else if (args[0] === "updateHydration") {
			return help.updateHydration;
		} else if (args[0] === "hydration") {
			return help.startHydration + '\n\n' + help.stopHydration + '\n\n' + help.updateHydration;
		} else if (args[0] === "whoAThot") {
			return help.whoAThot;
		} else {
			return "ThotBot Hydration cannot perform your request. See `*help` to see complete list of commands."
		}
	} else {
		return "Only one argument can be given at a time for the help command. To see all commands and brief descriptions simply use `*help` without any arguments."
	}
}
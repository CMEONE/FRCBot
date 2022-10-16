const { token, prefix, tba_key, tba_url, tba_awards } = require("./config.json");
let { footer } = require("./config.json");

console.log("bot is starting...");

const fetch = require("node-fetch");
const Discord = require('discord.js');

const client = new Discord.Client({
	presence: {
		activities: [{
			name: `for ${prefix}help | frcbot.togatech.org`,
			type: "WATCHING"
		}]
	},
	intents: [
		Discord.Intents.FLAGS.GUILDS,
		Discord.Intents.FLAGS.GUILD_MEMBERS,
		Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
		Discord.Intents.FLAGS.GUILD_MESSAGES,
		Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
		Discord.Intents.FLAGS.DIRECT_MESSAGES,
		Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
		Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING
	]
});

let ready = false;

function setStatus() {
	if (ready) {
		try {
			console.log("[STATUS] Attempting to reaffirm status", new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
			client.user.setActivity(`for ${prefix}help | frcbot.togatech.org`, {type: "WATCHING"});
			setTimeout(function() {
				setStatus();
			}, 60000);
			console.log("[STATUS] Finished attempt to reaffirm status", new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
		} catch(err) {
			console.log("[STATUS]", err);
		}
	}
}

const version_int = 4;
const version = "v1.0.3";
let update_waiting = false;
let old_footer = footer;
async function checkForUpdates() {
	try {
		let version_details = await (await fetch("https://frcbot.togatech.org/version")).json();
		if(version_details.latest_version_int > version_int && !update_waiting) {
			update_waiting = true;
			footer = `UPDATE AVAILABLE! Ask the moderators to update to FRC Bot version ${version_details.latest_version} (currently using ${version}) by downloading the latest code from GitHub.\n\n${old_footer}`;
		} else if(version_details.latest_version_int <= version_int) {
			update_waiting = false;
			footer = old_footer;
		}
	} catch(err) {
		console.log(err);
	}
}

setInterval(async () => {
	checkForUpdates();
}, 60000);
checkForUpdates();

client.on('ready', () => {
	console.log('FRC Bot is online');
	client.guilds.cache.forEach(function(guild_by_id) {
		client.guilds.fetch(guild_by_id.id).then((guild) => {
			console.log("FRC Bot running in: " + guild.name + " (id: " + guild.id + ") - " + guild.memberCount + " members");
		});
	});
	ready = true;
	setStatus();
});

function displayWebsite(website) {
	website = website.split("://").slice(1).join("");
	if(website.endsWith(".com/") || website.endsWith(".org/") || website.endsWith(".net/") || website.endsWith(".edu/") || website.endsWith(".co/")) {
		website = website.substring(0, website.length - 1);
	}
	return website;
}

function matchOverview(comp_level, set_number, match_number) {
	if(comp_level == "qm") {
		return `Quals ${match_number}`;
	} else if(comp_level == "ef") {
		return `Eighths ${set_number} Match ${match_number}`;
	} else if(comp_level == "qf") {
		return `Quarters ${set_number} Match ${match_number}`;
	} else if(comp_level == "sf") {
		return `Semis ${set_number} Match ${match_number}`;
	} else if(comp_level == "f") {
		return `Finals ${match_number}`;
	}
}

function formatWebcast(webcast) {
	if(webcast.type == "twitch") {
		return `[Twitch - ${webcast.key || webcast.channel}](https://www.twitch.tv/${webcast.key || webcast.channel})`;
	} else if(webcast.type == "youtube") {
		return `[YouTube](https://youtube.com/watch?v=${webcast.key || webcast.channel})`;
	} else if(webcast.type == "livestream") {
		return `[Livestream - ${webcast.key || webcast.channel}](https://livestream.com/accounts/${webcast.key || webcast.channel}/events/${webcast.file})`;
	} else if(webcast.type == "direct_link") {
		return `[Other](${webcast.key || webcast.channel})`;
	} else {
		return `${webcast.type} - ${webcast.key || webcast.channel}`
	}
}

client.on("messageCreate", async (msg) => {
	if (!msg.author.bot && msg.author.id != client.user.id) {
		let content = msg.content.toLowerCase();
		let content_raw = msg.content;
		let command = content.split(" ")[0];
		let command_raw = content_raw.split(" ")[0];
		let args_str = "";

		if (content.split(" ").length > 1) {
			args = content.split(" ");
			args.shift();
		} else {
			args = [];
		}
		if (args.length > 0) {
			args_str = content_raw.substring(content_raw.indexOf(' ') + 1);
		}
		if (content_raw.split(" ").length > 1) {
			args_raw = content_raw.split(" ");
			args_raw.shift();
		} else {
			args_raw = [];
		}
		let message = "";
		if (content_raw.split(" | ").length > 1) {
			message = content_raw.split(" | ")[1];
		}
		args = args.filter(arg => (arg != "" && arg != " "));
		args_raw = args_raw.filter(arg => (arg != "" && arg != " "));
		if (msg.channel.type != "dm") {
			let channelid = msg.channel.id;
		} else {
			let channelid = "";
		}
		let channel = msg.channel;
		if(msg.channel.type == "dm") {
			channel = msg.author;
		}
		//let nickname = msg.member.nickname;
		let nickname;
		try {
			nickname = msg.member.displayName;
		} catch (err) {
			nickname = msg.author.username;
		}
		try {
			let id = msg.member.id;
		} catch (err) {
			let id = msg.author.id;
		}
		try {
			let member = msg.member;
		} catch (err) {
			let member = msg.author;
		}
		let name = msg.author.tag;
		let resultEmbed;
		switch (command) {
			case `${prefix}help`:
				resultEmbed = new Discord.MessageEmbed()
					.setTitle("FRC Bot Help")
					.setColor("#005FA8")
					.setDescription("`{}` marks an input parameter, when specifying an input parameter, do not actually type the `{}`\n\n`?` marks an optional parameter, if you choose to specify an optional parameter, do not actually type the `?`, if you choose to not specify the parameter, leave the field blank\n\n`@user` refers to the user, not the username (example: <@!" + client.user.id + ">, not @FRC Bot)")
					.addFields({
						name: prefix + "info",
						value: "Shows information about this bot",
						inline: false
					}, {
						name: prefix + "team {team_number}",
						value: "Shows information for a team",
						inline: false
					}, {
						name: prefix + "eventsearch {year} {search_terms...}",
						value: "Searches for an event in a given year by either the event name, location, or city",
						inline: false
					}, {
						name: prefix + "event {event_key}",
						value: "Shows information for an event",
						inline: false
					}, {
						name: prefix + "teams {event_key}",
						value: "Shows the teams registered for an event",
						inline: false
					}, {
						name: prefix + "matches {event_key} {team_number}",
						value: "Shows the matches for a team",
						inline: false
					}, {
						name: prefix + "match {event_key} {type} {set} {match}",
						value: "Shows the stats for a match (types are `quals`, `eighths`, `quarters`, `semis`, `finals`), for qualification and finals matches use `1` for set",
						inline: false
					}, {
						name: prefix + "alliances {event_key}",
						value: "Shows the elimination alliances for an event",
						inline: false
					}, {
						name: prefix + "playoffs {event_key} {?type}",
						value: "Shows the playoff matches for an event (optioanl types are `eighths`, `quarters`, `semis`, `finals`)",
						inline: false
					}, {
						name: prefix + "rankings {event_key}",
						value: "Shows the rankings for an event",
						inline: false
					}, {
						name: prefix + "awards {event_key}",
						value: "Shows the awards for an event",
						inline: false
					}, {
						name: prefix + "teamawards {team_number}",
						value: "Shows the awards for a team",
						inline: false
					}, {
						name: prefix + "teamevents {team_number}",
						value: "Shows the events for a team",
						inline: false
					})
					.setFooter({
						text: footer
					});
					channel.send({ embeds: [resultEmbed] }).catch((err) => {
						console.log(err);
					});
				break;
			case `${prefix}info`:
				resultEmbed = new Discord.MessageEmbed()
					.setTitle("FRC Bot Info")
					.setColor("#005FA8")
					.addFields({
						name: "Website (Bot Invite Link)",
						value: "[frcbot.togatech.org](https://frcbot.togatech.org/)",
						inline: false
					}, {
						name: "GitHub (Source Code)",
						value: "[github.com/CMEONE/FRCBot](https://github.com/CMEONE/FRCBot)",
						inline: false
					})
					.setFooter({
						text: footer
					});
					channel.send({ embeds: [resultEmbed] }).catch((err) => {
						console.log(err);
					});
				break;
			case `${prefix}team`:
				if(args.length < 1 || isNaN(parseInt(args[0]))) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`team_number` must be a valid team number, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let team_number = parseInt(args[0]);
					try {
						let team = await (await fetch(`${tba_url}/team/frc${team_number}?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(team);
						if(team.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find team \`${team_number}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							let fields = [];
							if(team?.name != null) {
								fields.push({
									name: "Name",
									value: `${team.name}`,
									inline: false
								});
							}
							if(team?.school_name != null) {
								fields.push({
									name: "School",
									value: `${team.school_name}`,
									inline: false
								});
							}
							if(team?.location_name != null) {
								fields.push({
									name: "Location",
									value: `${team.location_name}`,
									inline: false
								});
							}
							if(team?.address == null) {
								let city = "";
								if(team.city != null) {
									city = `${team.city}, `;
								}
								let state_postal = "";
								if(team.state_prov != null && team.postal_code != null) {
									state_postal = `${team.state_prov} ${team.postal_code}, `;
								} else if (team.state_prov != null) {
									state_postal = `${team.state_prov}, `;
								} else if(team.postal_code != null) {
									state_postal = `${team.postal_code}, `;
								}
								let country = "";
								if(team.country != null) {
									country = `${team.country}`;
								}
								team.address = `${city}${state_postal}${country}`;
							}
							if(team?.gmaps_url != "") {
								if(team.address == null || team.address == "") {
									team.address = `[${displayWebsite(team.gmaps_url)}](${team.gmaps_url})`;
								} else {
									team.address = `[${team.address}](${team.gmaps_url})`;
								}
							}
							if(team?.address != null && team?.address != "") {
								fields.push({
									name: "Address",
									value: `${team.address}`,
									inline: false
								});
							}
							if(team?.rookie_year != null && team?.rookie_year != "") {
								fields.push({
									name: "Rookie Year",
									value: `${team.rookie_year}`,
									inline: false
								});
							}
							if(team?.motto != null && team?.motto != "") {
								fields.push({
									name: "Motto",
									value: `${motto}`,
									inline: false
								});
							}
							if(team?.website != "") {
								let website = displayWebsite(team.website);
								fields.push({
									name: "Website",
									value: `[${website}](${team.website})`,
									inline: false
								});
							}
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Team ${team_number}${team.nickname != null ? ` - ${team.nickname}` : ""}`)
								.setColor("#005FA8")
								.setDescription(`${team == null ? `The team requested does not exist.` : `The following details about team ${team_number} have been provided by The Blue Alliance:`}`)
								.addFields(fields)
								.setFooter({
									text: footer
								});
							}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}event`:
				if(args.length < 1) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`event_key` must be a valid TBA event key, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let event_key = args[0];
					try {
						let event = await (await fetch(`${tba_url}/event/${event_key}?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(event);
						if(event.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find event \`${event_key}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							let fields = [];
							if(event?.location_name != null) {
								fields.push({
									name: "Location",
									value: `${event.location_name}`,
									inline: false
								});
							}
							if(event?.address == null) {
								let city = "";
								if(event.city != null) {
									city = `${event.city}, `;
								}
								let state_postal = "";
								if(event.state_prov != null && event.postal_code != null) {
									state_postal = `${event.state_prov} ${event.postal_code}, `;
								} else if (event.state_prov != null) {
									state_postal = `${event.state_prov}, `;
								} else if(event.postal_code != null) {
									state_postal = `${event.postal_code}, `;
								}
								let country = "";
								if(event.country != null) {
									country = `${event.country}`;
								}
								event.address = `${city}${state_postal}${country}`;
							}
							if(event?.gmaps_url != "") {
								if(event.address == null || event.address == "") {
									event.address = `[${displayWebsite(event.gmaps_url)}](${event.gmaps_url})`;
								} else {
									event.address = `[${event.address}](${event.gmaps_url})`;
								}
							}
							if(event?.address != null && event.address != "") {
								fields.push({
									name: "Address",
									value: `${event.address}`,
									inline: false
								});
							}
							if(event?.start_date != null) {
								fields.push({
									name: "Starts",
									value: `${event.start_date}`,
									inline: false
								});
							}
							if(event?.end_date != null) {
								fields.push({
									name: "Ends",
									value: `${event.end_date}`,
									inline: false
								});
							}
							if(event?.timezone != null) {
								fields.push({
									name: "Timezone",
									value: `${event.timezone}`,
									inline: false
								});
							}
							if(event?.webcasts != null && event?.webcasts.length > 0) {
								fields.push({
									name: "Webcasts",
									value: `${event.webcasts.map((webcast) => {
										return formatWebcast(webcast);
									}).join("\n")}`,
									inline: false
								});
							}
							if(event?.website != "") {
								let website = displayWebsite(event.website);
								fields.push({
									name: "Website",
									value: `[${website}](${event.website})`,
									inline: false
								});
							}
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`${event.name || `Event ${event_key}`}${event.event_type_string != null ? ` (${event.event_type_string})` : ""}`)
								.setColor("#005FA8")
								.setDescription(`${event == null ? `The event requested does not exist or has not yet started.` : `The following details about event \`${event.name || event_key}\` have been provided by The Blue Alliance:`}`)
								.addFields(fields)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}eventsearch`:
				if(args.length < 2 || isNaN(parseInt(args[0]))) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`year` must be a valid TBA event key, and `search_terms...` must be valid search terms, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let year = parseInt(args[0]);
					let search_terms = args.slice(1);
					try {
						let events = await (await fetch(`${tba_url}/events/${year}/simple?X-TBA-Auth-Key=${tba_key}`)).json();
						console.log(events);
						if(events.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find events in the year \`${year}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							events = events.filter((event) => {
								if(event == null) {
									return false;
								}
								if(event.year != year) {
									return false;
								}
								let returning = false;
								for(let i = 0; i < search_terms.length; i++) {
									if((event.name || "").toLowerCase().includes(search_terms[i])) {
										returning = true;
									} else if((event.location_name || "").toLowerCase().includes(search_terms[i])) {
										returning = true;
									} else if((event.city || "").toLowerCase().includes(search_terms[i])) {
										returning = true;
									} else if(search_terms[i].toLowerCase() == "worlds" && (event.name || "").toLowerCase().includes("championship")) {

									} else {
										return false;
									}
								}
								return returning;
							});
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Search Results`)
								.setColor("#005FA8")
								.setDescription(`${events.length == 0 ? `Could not find any events that fulfilled the search criteria.` : events.map((event) => {
									if(event.name == null) {
										return `${event.key}${event.location_name != null ? ` - ${event.location_name}` : " - Unknown"}`;
									} else {
										return `${event.key} - ${event.name}${event.location_name != null ? ` (${event.location_name})` : ""}`;
									}
								}).join("\n")}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}teams`:
				if(args.length < 1) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`event_key` must be a valid TBA event key, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let event_key = args[0];
					try {
						let teams = await (await fetch(`${tba_url}/event/${event_key}/teams/simple?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(teams);
						if(teams.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find event \`${event_key}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Teams`)
								.setColor("#005FA8")
								.setDescription(`${teams.map(team => `${team.nickname != null ? `${team.nickname}` : "Team"}${(team.nickname || "").endsWith(team.team_number) ? "" : ` ${team.team_number}`}`).join("\n")}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}matches`:
				if(args.length < 2 || isNaN(parseInt(args[1]))) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`event_key` must be a valid TBA event key, and `team_number` must be a vaild team number, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let event_key = args[0];
					let team_number = parseInt(args[1]);
					try {
						let matches = await (await fetch(`${tba_url}/event/${event_key}/matches?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(matches);
						if(matches.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find event \`${event_key}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							matches = matches.filter((match) => {
								if((match?.alliances?.blue?.team_keys || []).includes(`frc${team_number}`)) {
									return true;
								}
								if((match?.alliances?.red?.team_keys || []).includes(`frc${team_number}`)) {
									return true;
								}
								return false;
							}).sort((match1, match2) => match1.time - match2.time);
							// console.log(matches);
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Matches for Team ${team_number}`)
								.setColor("#005FA8")
								.setDescription(`${matches.length == 0 ? `No matches found for team \`${team_number}\`.` : matches.map((match) => {
									return `**${matchOverview(match.comp_level, match.set_number, match.match_number)}** <t:${match.actual_time || match.time}:R>
Red Alliance: ${match.alliances.red.team_keys.map(team => team.replace("frc", "")).join(", ")}
Blue Alliance: ${match.alliances.blue.team_keys.map(team => team.replace("frc", "")).join(", ")}`;

								}).join("\n")}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}match`:
				if(args.length < 4 || !["quals", "eighths", "quarters", "semis", "finals"].includes(args[1].toLowerCase()) || isNaN(parseInt(args[2])) || isNaN(parseInt(args[3]))) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`event_key` must be a valid TBA event key, `type` must be a valid match type, `set` must be a valid set number, and `match` must be a valid match number, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let event_key = args[0];
					let type = args[1].toLowerCase();
					let set_number = parseInt(args[2]);
					let match_number = parseInt(args[3]);
					try {
						let matches = await (await fetch(`${tba_url}/event/${event_key}/matches?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(matches);
						if(matches.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find event \`${event_key}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							let match_details = matches.find((match) => {
								if(type == "quals" && match.comp_level != "qm") {
									return false;
								}
								if(type == "eighths" && match.comp_level != "ef") {
									return false;
								}
								if(type == "quarters" && match.comp_level != "qf") {
									return false;
								}
								if(type == "semis" && match.comp_level != "sf") {
									return false;
								}
								if(type == "finals" && match.comp_level != "f") {
									return false;
								}
								if(match.set_number != set_number) {
									return false;
								}
								if(match.match_number != match_number) {
									return false;
								}
								return true;
							});
							// console.log(matches);
							// console.log(match_details);
							let fields = [];
							if(match_details?.time != null && match_details?.time > 0) {
								fields.push({
									name: "Time",
									value: `<t:${match_details.time}:R>`,
									inline: false
								});
							}
							if(match_details?.alliances?.red?.team_keys != null && match_details?.alliances?.red?.team_keys?.length > 0) {
								fields.push({
									name: "Red Alliance",
									value: `${match_details.alliances.red.team_keys.map(team => team.replace("frc", "")).join(", ")}`,
									inline: false
								});
							}
							if(match_details?.alliances?.blue?.team_keys != null && match_details?.alliances?.blue?.team_keys?.length > 0) {
								fields.push({
									name: "Blue Alliance",
									value: `${match_details.alliances.blue.team_keys.map(team => team.replace("frc", "")).join(", ")}`,
									inline: false
								});
							}
							if(match_details?.score_breakdown?.red?.totalPoints != null) {
								fields.push({
									name: "Red Score",
									value: `${match_details.score_breakdown.red.totalPoints}`,
									inline: false
								});
							}
							if(match_details?.score_breakdown?.blue?.totalPoints != null) {
								fields.push({
									name: "Blue Score",
									value: `${match_details.score_breakdown.blue.totalPoints}`,
									inline: false
								});
							}
							if(match_details?.winning_alliance != null && match_details?.winning_alliance != "") {
								fields.push({
									name: "Winner",
									value: `${match_details.winning_alliance.substring(0, 1).toUpperCase()}${match_details.winning_alliance.substring(1)} Alliance`,
									inline: false
								});
							}
							if(match_details?.videos != null && match_details?.videos?.length > 0) {
								fields.push({
									name: "Videos",
									value: `${match_details.videos.map((video) => {
										return formatWebcast(video);
									}).join("\n")}`,
									inline: false
								});
							}
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`${type.substring(0, 1).toUpperCase()}${type.substring(1)}${type == "quals" || type == "finals" ? "" : ` Set ${set_number}`} Match ${match_number}`)
								.setColor("#005FA8")
								.setDescription(`${match_details == null ? `The match requested does not exist or has not yet started.` : `The following details about \`${type}${type == "quals" || type == "finals" ? "" : ` set ${set_number}`} match ${match_number}\` have been provided by The Blue Alliance:`}`)
								.addFields(fields)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}alliances`:
				if(args.length < 1) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`event_key` must be a valid TBA event key, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let event_key = args[0];
					try {
						let alliances = await (await fetch(`${tba_url}/event/${event_key}/alliances?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(alliances);
						if(alliances.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find event \`${event_key}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Elimination Alliances`)
								.setColor("#005FA8")
								.setDescription(`${alliances.length > 0 ? alliances.map((alliance, index) => {
									return `**Alliance ${index + 1}**: ${alliance.picks.map((pick, index) => {
										if(index == 0) {
											return `${pick.replace("frc", "")} (Captain)`;
										} else {
											return `${pick.replace("frc", "")} (Pick ${index})`;
										}
									}).join(", ")}`
								}).join("\n") : "Elimination alliances have not yet been decided for this event."}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}playoffs`:
				if(args.length < 1) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`event_key` must be a valid TBA event key, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let event_key = args[0];
					let type = (args[1] || "").toLowerCase();
					try {
						let matches = await (await fetch(`${tba_url}/event/${event_key}/matches?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(matches);
						if(matches.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find event \`${event_key}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							matches = matches.filter((match) => {
								if(match.comp_level == "qm") {
									return false;
								}
								if(type == "eighths" && match.comp_level != "ef") {
									return false;
								}
								if(type == "quarters" && match.comp_level != "qf") {
									return false;
								}
								if(type == "semis" && match.comp_level != "sf") {
									return false;
								}
								if(type == "finals" && match.comp_level != "f") {
									return false;
								}
								return true;
							}).sort((match1, match2) => match1.time - match2.time);
							// console.log(matches);
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`${type == "" ? "" : `${type[0].toUpperCase()}${type.substring(1)} `}Playoff Matches`)
								.setColor("#005FA8")
								.setDescription(`${matches.length == 0 ? `${type == "" ? "Playoff" : `${type[0].toUpperCase()}${type.substring(1)} playoff`} matches have not yet been decided for this event.` : matches.map((match) => {
									return `**${matchOverview(match.comp_level, match.set_number, match.match_number)}** <t:${match.actual_time || match.time}:R>
Red Alliance: ${match.alliances.red.team_keys.map(team => team.replace("frc", "")).join(", ")}
Blue Alliance: ${match.alliances.blue.team_keys.map(team => team.replace("frc", "")).join(", ")}`;
								}).join("\n")}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}rankings`:
				if(args.length < 1) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`event_key` must be a valid TBA event key, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let event_key = args[0];
					try {
						let rankings = await (await fetch(`${tba_url}/event/${event_key}/rankings?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(rankings);
						if(rankings.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find event \`${event_key}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							rankings = rankings.rankings.sort((ranking1, ranking2) => ranking1.rank - ranking2.rank);
							// console.log(rankings);
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Rankings`)
								.setColor("#005FA8")
								.setDescription(`${rankings.map((ranking, index) => {
									return `**${index + 1}.** ${ranking.team_key.replace("frc", "")}`;
								}).join("\n")}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}awards`:
				if(args.length < 1) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`event_key` must be a valid TBA event key, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let event_key = args[0];
					try {
						let awards = await (await fetch(`${tba_url}/event/${event_key}/awards?X-TBA-Auth-Key=${tba_key}`)).json();
						if(awards.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find event \`${event_key}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							awards = awards.sort((award1, award2) => award1.award_type - award2.award_type);
							// console.log(awards);
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Awards`)
								.setColor("#005FA8")
								.setDescription(`${awards.length > 0 ? awards.map((award) => {
									return `**${award.name}:** ${award.recipient_list.map((recipient) => {
										if(recipient.team_key != null) {
											return recipient.team_key.replace("frc", "");
										} else if(recipient.awardee != null) {
											return recipient.awardee;
										} else {
											return "Unknown";
										}
									}).join(", ")}`;
								}).join("\n") : "Awards have not yet been decided for this event."}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}teamawards`:
				if(args.length < 1 || isNaN(parseInt(args[0]))) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`team_number` must be a valid team number, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let team_number = parseInt(args[0]);
					try {
						let awards = await (await fetch(`${tba_url}/team/frc${team_number}/awards?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(awards);
						if(awards.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find team \`${team_number}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							awards = awards.sort((award1, award2) => (10000 * (award2.year - award1.year)) + (award1.award_type - award2.award_type));
							// console.log(awards);
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Awards for Team ${team_number}`)
								.setColor("#005FA8")
								.setDescription(`${awards.map((award) => {
									return `**${award.name}** (${award.event_key})`;
								}).join("\n")}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			case `${prefix}teamevents`:
				if(args.length < 1 || isNaN(parseInt(args[0]))) {
					resultEmbed = new Discord.MessageEmbed()
						.setTitle("Error")
						.setColor("#FF0000")
						.setDescription("`team_number` must be a valid team number, please try again!")
						.setFooter({
							text: footer
						});
				} else {
					let team_number = parseInt(args[0]);
					try {
						let events = await (await fetch(`${tba_url}/team/frc${team_number}/events/simple?X-TBA-Auth-Key=${tba_key}`)).json();
						// console.log(events);
						if(events.Error != null) {
							resultEmbed = new Discord.MessageEmbed()
								.setTitle("Error")
								.setColor("#FF0000")
								.setDescription(`Could not find team \`${team_number}\`!`)
								.setFooter({
									text: footer
								});
						} else {
							events = events.sort((event1, event2) => (event2.year - event1.year));
							// console.log(events);
							// console.log(events[0]);
							resultEmbed = new Discord.MessageEmbed()
								.setTitle(`Events for Team ${team_number}`)
								.setColor("#005FA8")
								.setDescription(`${events.map((event) => {
									return `**${event.name.replace("*", "\\*")}** (${event.key})`;
								}).join("\n")}`)
								.setFooter({
									text: footer
								});
						}
					} catch(err) {
						console.log(err);
						resultEmbed = new Discord.MessageEmbed()
							.setTitle("Error")
							.setColor("#FF0000")
							.setDescription("Unable to connect to The Blue Alliance, please try again later!")
							.setFooter({
								text: footer
							});
					}
				}
				channel.send({ embeds: [resultEmbed] }).catch((err) => {
					console.log(err);
				});
				break;
			default:

		}
	}
});

client.login(token);
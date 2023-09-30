import "dotenv/config";
import { Client } from "discord.js";
import { IntentsBitField } from "discord.js";
import moment from 'moment-timezone';
import { formatHoursExt, formatMinutesExt, formatSecondsExt } from "./formatTimeExt.js";

let API_RESPONSE = {};
let MESSAGE_IDS = [ "1157714802576216154", "1157715633136468108" ];
let COUNTDOWN;

const CLOSE_TIME = new Date(1696106700000);

const client = new Client({
  intents: [ IntentsBitField.Flags.Guilds ] 
});

client.on("ready", () => {
  console.log("I am ready!");

  check();

  COUNTDOWN = setInterval(async() => {
    // check if we are past the close time
    if (moment().tz("Europe/Bratislava").isAfter(moment(CLOSE_TIME))) {
      clearInterval(COUNTDOWN);

      const channel = client.channels.cache.get("1157706057355886713");
      const message = await channel.messages.fetch("1157719183870677112");

      await message.edit(
        `Volebné miestnosti sú zatvorené!`
      );

      return;
    }

    const countdown = moment.duration(moment(CLOSE_TIME).diff(moment().tz("Europe/Bratislava")));
    const hours = countdown.hours();
    const minutes = countdown.minutes();
    const seconds = countdown.seconds();

    const channel = client.channels.cache.get("1157706057355886713");
    const message = await channel.messages.fetch("1157719183870677112");

    await message.edit(
      `Do zatvorenia volebných miestností ostáva: **<t:${Math.round(CLOSE_TIME.getTime() / 1000)}:R>** (${hours} ${formatHoursExt(hours)}, ${minutes} ${formatMinutesExt(minutes)}, ${seconds} ${formatSecondsExt(seconds)})`
    )
  }, 5_000);
});

function splitArray(array, chunkSize) {
  const result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

async function check() {
  await fetchAll();

  const channel = client.channels.cache.get("1157706057355886713");

  const data = API_RESPONSE.data.map((result) => {
          return `#${result.partyOrder} **${result.name}** (${result.fullName}) - **${result.votesCount}** (**${result.votesPercent}%**) hlasov`;
  });

  const chunks = splitArray(data, Math.round(data.length / 2));

  for (let i = 0; i < chunks.length; i++) {
    const message = await channel.messages.fetch(MESSAGE_IDS[i]);
    const chunk = chunks[i];

    await message.edit({
      content: chunk.join("\n"),
      embeds: []
    });
  }

  const currentDataMessage = await channel.messages.fetch("1157715656398082139");
  const lastChange = moment(new Date(API_RESPONSE.currentData.last_changed * 1000)).tz("Europe/Bratislava").format("DD/MM/YYYY HH:mm:ss");;

  await currentDataMessage.edit([
    `Volebná účasť: **${API_RESPONSE.currentData.attendance}%**`,
    `Spočítaných hlasov: **${API_RESPONSE.currentData.votes_counted}%**`,
    `Posledná aktualizácia: **${lastChange}**`,
  ].join("\n"));

  setTimeout(check, 30_000);
}

async function fetchAll() {
  const response = await fetch("https://www.aktuality.sk/_s/api/election/results/parliament/volby-2023/");
  const body = await response.json();
  API_RESPONSE = body;
}

process.on("uncaughtException", console.log);
process.on("unhandledRejection", console.log);

client.login(process.env.DISCORD_BOT_TOKEN);

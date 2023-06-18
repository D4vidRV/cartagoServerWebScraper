import { Client, IntentsBitField, MessagePayload } from "discord.js";
import * as cron from "node-cron";
import randomUserAgent from "random-useragent";
import puppeteer from "puppeteer";
import chromium from "chrome-aws-lambda";
import { mapsURL } from "./interfaces/mapsUrl";
import { dinoArk } from "./interfaces/dino";
import { dinosOfInterest } from "./dinos_of_interest";
import {
  BASESTATSPOSITIONS,
  OVERVIEWPOSITIONS,
} from "./interfaces/baseStatsTable";

export const initBot = () => {
  // **********DISCORD**********
  const client = new Client({
    intents: [
      IntentsBitField.Flags.Guilds,
      IntentsBitField.Flags.GuildMembers,
      IntentsBitField.Flags.GuildMessages,
      IntentsBitField.Flags.MessageContent,
    ],
  });

  const channelID = process.env.CHANNEL_ID || "000000000";

  client.on("ready", (c) => {
    console.log(`✅ ${c.user.tag} is online`);

    // Init CRONJOB
    cron.schedule("* * * * *", async () => {
      console.log("looking dinos...");

      // PUPPETEER CONFIG
      const userAgent = randomUserAgent.getRandom();
      const CONFIG_PUPPETER = {
        headless: true,
        args: [userAgent, "--window-size=1200,800"],
      };
      const browser = await puppeteer.launch(CONFIG_PUPPETER);
      const page = await browser.newPage();
      page.setDefaultTimeout(99000);
      await page.setViewport({ width: 1920, height: 1080 });

      const dinosDeInteres = dinosOfInterest;

      for (const mapURL of Object.values(mapsURL)) {
        console.log(mapURL);

        try {
          await page.goto(mapURL);

          // ************MODAL************
          await page.waitForXPath("/html/body/div[2]/div/header/span");
          const loginTable = await page.$x("/html/body/div[2]/div/header/span");
          if (loginTable.length > 0) {
            loginTable[0].dispose;
          } else {
            console.log("No se encontró el elemento");
          }

          // ************WILD CREATURES BUTTOM************
          await page.waitForXPath(
            "/html/body/app-server-menu/app-menu/div/section/div/div[3]"
          );
          const wildButton = await page.$x(
            "/html/body/app-server-menu/app-menu/div/section/div/div[3]"
          );
          if (wildButton.length > 0) {
            let textoButton = await page.evaluate((wildButton) => {
              return wildButton?.innerText;
            }, wildButton[0]);

            await wildButton[0].click();
            await wildButton[0].click();
            console.log(textoButton);
          } else {
            console.log("No se encontró el elemento");
          }

          // ****************SELECT****************
          const select = await page.waitForXPath(
            "/html/body/div[1]/app-server/section/select"
          );
          const selectOptions = await page.$x(
            "/html/body/div[1]/app-server/section/select/option"
          );

          if (selectOptions.length > 0) {
            // Por cada opcion del SELECT
            for (const option of selectOptions) {
              const valueText = await page.evaluate((option) => {
                return option?.value;
              }, option);
              // Evaluar si el valueText esta dentro del array de dinos de interés
              const filteredInterestDinos = dinosDeInteres.filter(
                (dino) => dino.name.id === valueText
              );
              // Si el dino.name.ID de interés se encuentra dentro de las opciones...
              if (filteredInterestDinos.length > 0) {
                // Selecciono la opcion
                await select?.select(`${valueText}`);

                // ******Click en "Base Stats"*****
                const baseStatsButton = await page.$x(
                  "/html/body/div[1]/app-server/section/div[2]/button[2]"
                );
                baseStatsButton[0].click();
                baseStatsButton[0].click();
                await page.waitForTimeout(500);

                // Get all rows in table body
                const tableBodyRows = await page.$x(
                  "/html/body/div[1]/app-server/section/div[3]/table/tbody/tr"
                );

                const dinosInTable: dinoArk[] = [];

                // Por cada dino en filteredInterestDinos
                for (const filteredInteresDino of filteredInterestDinos) {
                  // Iteration for each row(dino) in table
                  for (const [index, value] of tableBodyRows.entries()) {
                    // Get all cells of row
                    const cells = await value.$x("./td");

                    // *************PARSEO cada row en un dino**********
                    const dinoRow: dinoArk = {
                      name: {
                        id: filteredInterestDinos[0].name.id,
                        name: filteredInterestDinos[0].name.name,
                      },
                      gender: await page.evaluate((cell) => {
                        return cell?.innerText;
                      }, cells[BASESTATSPOSITIONS.Gender]),
                      lvl: {
                        min: parseInt(
                          await page.evaluate((cell) => {
                            return cell?.innerText;
                          }, cells[BASESTATSPOSITIONS.Base_lvl])
                        ),
                        max: parseInt(
                          await page.evaluate((cell) => {
                            return cell?.innerText;
                          }, cells[BASESTATSPOSITIONS.Base_lvl])
                        ),
                      },
                      stat: {
                        name: filteredInteresDino.stat.name,
                        minPoints: await page.evaluate((cell) => {
                          return cell?.innerText;
                        }, cells[filteredInteresDino.stat.positionInTable ?? 0]),
                      },
                      indexInTable: index + 1,
                    };

                    dinosInTable.unshift(dinoRow);
                  }
                  // filtered dinos
                  const matchedDinos: dinoArk[] = dinosInTable
                    .filter((dino) => {
                      // Filtrar por género
                      if (dino.gender !== filteredInteresDino.gender) {
                        return false;
                      }

                      // Filtrar por nivel mínimo y máximo
                      if (
                        dino.lvl.min < filteredInteresDino.lvl.min ||
                        dino.lvl.max > filteredInteresDino.lvl.max
                      ) {
                        return false;
                      }

                      // Filtrar por estadísticas
                      if (
                        filteredInteresDino.stat.name !== dino.stat.name ||
                        filteredInteresDino.stat.minPoints > dino.stat.minPoints
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .reverse();
                  // ******Click en "Overview"*****
                  const overviewButton = await page.$x(
                    "/html/body/div[1]/app-server/section/div[2]/button[1]"
                  );
                  overviewButton[0].click();
                  overviewButton[0].click();
                  await page.waitForTimeout(500);

                  for (const matchedDino of matchedDinos) {
                    const tableBodyRowOverView = await page.$x(
                      `/html/body/div[1]/app-server/section/div[3]/table/tbody/tr[${matchedDino.indexInTable}]`
                    );
                    // Obtener el innerText del td Lat y Lng del tableBodyRowOverView
                    for (const [_, value] of tableBodyRowOverView.entries()) {
                      const cells = await value.$x("./td");
                      matchedDino.cords = {
                        lat: await page.evaluate((cell) => {
                          return cell?.innerText;
                        }, cells[OVERVIEWPOSITIONS.LAT]),
                        lng: await page.evaluate((cell) => {
                          return cell?.innerText;
                        }, cells[OVERVIEWPOSITIONS.LNG]),
                      };
                    }
                  }
                  // filtar por el index del dino

                  // console.log(matchedDinos);
                  if (matchedDinos.length > 0) {
                    matchedDinos.forEach((dino) => {
                      const message = {
                        color: 0x0099ff,
                        title: "DINO ENCONTRADO!!",
                        description:
                          "¡HE ENCONTRADO UN DINO HIJOS DE PUTA A TAMEARLO!",
                        fields: [
                          {
                            name: "Dino",
                            value: `${dino.name.name}`,
                            inline: true,
                          },
                          {
                            name: "Género",
                            value: `${dino.gender}`,
                            inline: true,
                          },
                          {
                            name: "Lvl",
                            value: `${dino.lvl.min}`,
                            inline: true,
                          },
                          {
                            name: "Mapa",
                            value: `${mapURL.split("/").pop()}`,
                            inline: true,
                          },
                          {
                            name: "Lat",
                            value: `${dino.cords?.lat}`,
                            inline: true,
                          },
                          {
                            name: "Lng",
                            value: `${dino.cords?.lng}`,
                            inline: true,
                          },
                        ],
                        timestamp: new Date().toISOString(),
                      };

                      // *******ENVIAR MENSAJE DE DISCORD*********
                      const channel = client.channels.cache.get(channelID);

                      if (channel?.isTextBased()) {
                        channel.send("@everyone");
                        channel.send({ embeds: [message] });
                      } else {
                        console.log("No se encontró el canal de texto");
                      }
                    });
                  }
                  // ******Click en "Base Stats"*****
                  const baseStatsButton = await page.$x(
                    "/html/body/div[1]/app-server/section/div[2]/button[2]"
                  );
                  baseStatsButton[0].click();
                  baseStatsButton[0].click();
                  await page.waitForTimeout(500);
                }
              }
            }
          } else {
            console.log("No se encontró el elemento");
          }
        } catch (error) {
          console.log(error);
        }
      }
    });
  });

  client.login(process.env.BOT_TOKEN);
};

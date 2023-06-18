import { Client } from "discord.js";

export class ExtendedClient extends Client {
  constructor() {
    super({
      intents: [
        "AutoModerationConfiguration"
      ]
    });
  }
}

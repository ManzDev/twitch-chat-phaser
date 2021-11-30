import Phaser from "phaser";
import { client as ws } from "../modules/SocketClient.js";
import { fontSize, styles } from "../modules/config.js";

const LIMIT_USERS = 9;

const USER_IMAGES = [
  "astronaut", "batmanz", "ciclope", "glados-potato", "goku-yellow", "gopher",
  "gordon-freeman", "ironmanz", "jack", "joker", "king", "luigi", "manzdev",
  "manzdevocado", "mario", "operator", "pirate", "queen", "streamer", "tanooki",
  "teacher", "terminator"
];

export class MainScene extends Phaser.Scene {
  preload() {
    USER_IMAGES.forEach(name => this.load.image(name, `assets/sprites/${name}.png`));
  }

  create() {
    this.players = [];
    this.isPlaying = false;

    this.readyMessage = this.add.text(565, 15, "Waiting for players...", { ...styles, fontSize: 32, color: "red" });

    const addPlayer = (name, character = "manzdev") => {
      const x = Phaser.Math.Between(0, this.game.config.width);
      const y = Phaser.Math.Between(0, this.game.config.height);
      const textOffset = fontSize / 1.25;
      const trapCharacter = name === "m_akali" ? "gopher" : character;
      const image = this.add.image(0, 0, trapCharacter).setScale(2);
      const text = this.add.text(0, textOffset, name, styles).setOrigin(0.5, 0);
      const container = this.add.container(x, y);
      container.add([image, text]);

      const user = { name, player: container };
      this.players.push(user);
      return user;
    };

    console.log(this.players);

    ws.onmessage = event => {
      const { nick, color, message } = JSON.parse(event.data);
      console.log("MENSAJE RECIBIDO: ", { nick, message });

      const command = message.split(" ")[0].toLowerCase();
      const hasUserSelected = this.players.some(user => user.name === nick);
      const isPlayListFull = this.players.length >= LIMIT_USERS;

      if (command === "!play" && !hasUserSelected && !isPlayListFull) {
        const indexSelected = Phaser.Math.Between(0, USER_IMAGES.length - 1);
        const user = addPlayer(nick, USER_IMAGES[indexSelected]);
        user.player.getAt(1).setColor(color);

        if (this.players.length === LIMIT_USERS) {
          this.startGame();
        }

        const usersToOrder = this.players.map(user => user.player);
        Phaser.Actions.GridAlign(usersToOrder, {
          width: 1,
          height: 10,
          cellWidth: 60,
          cellHeight: 60,
          x: 100,
          y: 80
        });
      }

      if (command === "!nitro" && this.isPlaying) {
        const user = this.players.find(user => user.name === nick);
        if (user) {
          user.player.x += Phaser.Math.Between(0, 15);
          user.player.getAt(0).setTint(0xffff00, 0xffff00, 0x000000, 0x000000);
          this.time.addEvent({
            delay: 500,
            callback: () => user.player.getAt(0).clearTint()
          });
        }
      }
    };
  }

  startGame() {
    this.isPlaying = true;
    this.readyMessage.setText("Ready to play!").setColor("lime");
  }

  update() {
    if (this.isPlaying) {
      this.players.forEach(user => {
        user.player.x += Phaser.Math.Between(0, 1);
      });
    }

    const isEndReached = this.players.some(user => user.player.x > 700);

    if (isEndReached && this.isPlaying) {
      this.isPlaying = false;
      const winner = this.players.find(user => user.player.x > 700);

      this.players.forEach(user => user.player.setAlpha(0.15));
      winner.player.setAlpha(1);

      this.tweens.add({
        targets: winner.player,
        y: { from: winner.player.y, to: winner.player.y - 10 },
        ease: "Linear",
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
  }
}

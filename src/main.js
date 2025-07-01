import { Preload } from './scenes/Preload.js';
import { Start } from './scenes/Start.js';
import { Game } from './scenes/Game.js';

const config = {
    type: Phaser.AUTO,
    title: 'Happy Farm',
    description: '',
    parent: 'game-container',
    width: 1200,
    height: 2330,
    backgroundColor: '#000000',
    pixelArt: false,
    scene: [
        Preload,
        Start,
        Game
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
}

new Phaser.Game(config);
            
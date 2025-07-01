export class Preload extends Phaser.Scene {

    constructor() {
        super('Preload');
    }

    preload() {
        // สร้าง loading bar
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: 'กำลังโหลด...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);

        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);

        const assetText = this.make.text({
            x: width / 2,
            y: height / 2 + 50,
            text: '',
            style: {
                font: '14px monospace',
                fill: '#ffffff'
            }
        });
        assetText.setOrigin(0.5, 0.5);

        // อัพเดท progress bar
        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText('กำลังโหลด: ' + file.key);
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            assetText.destroy();
        });

        // โหลดรูปภาพทั้งหมด
        this.load.image('background-menu', 'assets/BG_MENU.png');
        this.load.image('background-play', 'assets/BG_PLAY.png');
        this.load.image('popup-score', 'assets/POPUP_SCORE.png');
        this.load.image('popup-win', 'assets/POPUP_WIN.png');
        this.load.image('rule', 'assets/RULE.png');
        this.load.image('hand-cursor', 'assets/HAND_CURSOR.png');
        this.load.image('coin-bg', 'assets/COIN_BG.png');
        this.load.image('time-bg', 'assets/TIME_BG.png');
        this.load.image('btn-rule', 'assets/BTN_RULE.png');
        this.load.image('exit-btn', 'assets/EXIT_BTN.png');
        this.load.image('btn-play', 'assets/BTN_PLAY.png');
        this.load.image('fruit1', 'assets/FRUIT1.png');
        this.load.image('fruit1-active', 'assets/FRUIT1-ACTIVE.png');
        this.load.image('fruit2', 'assets/FRUIT2.png');
        this.load.image('fruit2-active', 'assets/FRUIT2-ACTIVE.png');
        this.load.image('fruit3', 'assets/FRUIT3.png');
        this.load.image('fruit3-active', 'assets/FRUIT3-ACTIVE.png');
        this.load.image('fruit4', 'assets/FRUIT4.png');
        this.load.image('fruit4-active', 'assets/FRUIT4-ACTIVE.png');

        this.load.font('62Regular', 'assets/fonts/62_REGULAR.otf', 'opentype');
        this.load.font('4Believe', 'assets/fonts/4Believe.ttf', 'truetype');
    }

    create() {
        // เมื่อโหลดเสร็จแล้ว ให้ไปหน้า Start
        this.scene.start('Start');
    }
} 
import { createButtonWithImage } from './utils.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    create() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        
        this.isRulePopupOpen = false;

        // Add background image and scale it to fill the entire screen
        this.add.image(0, 0, 'background-menu')
            .setOrigin(0, 0)
            .setDisplaySize(gameWidth, gameHeight);

        // ปุ่มเล่นเลย (start)
        this.startButton = createButtonWithImage(
            this,
            gameWidth / 2,
            1070,
            'btn-play',
            '',
            1.6,
            {},
            1.5,
            () => {
                if(this.isRulePopupOpen) return;
                // Fade out ก่อนเปลี่ยน scene
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('Game');
                });
            }
        );

        this.canPlayText = this.add.text(
            gameWidth / 2 - 150,
            830,
            'เล่นได้ 0/1 ครั้ง',
            { fontSize: '50px', fill: '#00A347', fontFamily: 'Prompt, sans-serif' }
        );

        // ปุ่มกติกา (rule)
        this.ruleButton = createButtonWithImage(
            this,
            120,
            2150,
            'btn-rule',
            '',
            1.6,
            {},
            1.5,
            () => {
                if(this.isRulePopupOpen) return;
                this.isRulePopupOpen = true;
                // สร้าง backdrop มืดเพื่อให้รูป Rule เด่นขึ้น
                this.backdrop = this.add.rectangle(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2,
                    this.cameras.main.width,
                    this.cameras.main.height,
                    0x000000
                ).setAlpha(0);

                this.rule = this.add.image(
                    this.cameras.main.width / 2,
                    this.cameras.main.height / 2, 'rule')
                    .setOrigin(0.5, 0.5)
                    .setScale(1.6)
                    .setAlpha(0);

                // เพิ่มข้อความกติกา
                this.ruleText = this.add.text(
                    this.cameras.main.width / 2 + 35,
                    this.cameras.main.height / 2 + 50,
                    '1. ผู้ร่วมกิจกรรมจะได้รับสิทธิ์ในการเล่นกิจกรรม \n1 สิทธิ์/วัน\n2. ผู้ร่วมกิจกรรมมีเวลา 30 วินาทีในการเก็บผลไม้\n3. เก็บผลไม้ได้ต่อกันผลละ 1 คนแนน \nเก็บต่อกันได้ 10 คะแนน รับโบนัสเพิ่ม 5 คะแนน\n4. คะแนนและของรางวัลอื่น ๆ ไม่สามารถ\nเปลี่ยนแปลงหรือแลกคืนเป็นเงินสดได้\nโดยของรางวัลที่ได้รับในแต่ละรอบอาจะแตกต่างกัน',
                    {
                        fontSize: '30px',
                        fill: '#000000',
                        fontFamily: 'Prompt, sans-serif',
                        align: 'left',
                        lineSpacing: 10,
                    }
                )
                .setOrigin(0.5, 0.5)
                .setAlpha(0)

                // ปุ่มปิดล่องหน
                this.closeButton = this.add.circle(
                    1100,
                    820,
                    60,
                    0x000000
                )
                .setOrigin(0.7, 0.7)
                .setDepth(102)
                .setAlpha(0.01)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => {
                    // Fade out ก่อนลบ
                    this.tweens.add({
                        targets: [this.backdrop, this.rule, this.ruleText],
                        alpha: 0,
                        duration: 300,
                        ease: 'Power2',
                        onComplete: () => {
                            this.backdrop.destroy();
                            this.rule.destroy();
                            this.ruleText.destroy();
                            this.closeButton.destroy();
                            this.isRulePopupOpen = false;
                        }
                    });
                });

                // Fade in effects
                this.tweens.add({
                    targets: this.backdrop,
                    alpha: 0.7,
                    duration: 300,
                    ease: 'Power2'
                });

                this.tweens.add({
                    targets: [this.rule, this.ruleText],
                    alpha: 1,
                    duration: 400,
                    delay: 100,
                    ease: 'Power2'
                });
            }
        );

        // ปุ่มออก (exit)
        this.exitButton = createButtonWithImage(
            this,
            gameWidth - 120,
            2150,
            'exit-btn',
            '',
            1.6,
            {},
            1.5,
            () => {
                this.cameras.main.fadeOut(500, 0, 0, 0);
            }
        );
    }

    update() {

    }
    
}
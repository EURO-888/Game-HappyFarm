import { createButtonWithImage } from './utils.js';

export class Start extends Phaser.Scene {

    constructor() {
        super('Start');
    }

    create() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;
        
        // Add background image and scale it to fill the entire screen
        this.add.image(0, 0, 'background-menu')
            .setOrigin(0, 0)
            .setDisplaySize(gameWidth, gameHeight);

        // ปุ่มเล่นเลย (start)
        this.startButton = createButtonWithImage(
            this,
            gameWidth / 2,
            1050,
            'btn-play',
            '',
            1.6,
            {},
            1.5,
            () => {
                // Fade out ก่อนเปลี่ยน scene
                // this.cameras.main.fadeOut(500, 0, 0, 0);
                // this.cameras.main.once('camerafadeoutcomplete', () => {
                //     // this.scene.start('Game');
                // });
            }
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
                this.showRuleModal();
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

    showRuleModal() {
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

        // สร้าง container สำหรับ scrollable content
        this.textContainer = this.add.container(0, 0);
        
        // กำหนดพื้นที่ที่จะแสดง text (scroll area)
        const scrollAreaX = this.cameras.main.width / 2 + 35;
        const scrollAreaY = this.cameras.main.height / 2 + 65;
        const scrollAreaWidth = 750; // ความกว้างของพื้นที่ scroll
        const scrollAreaHeight = 380; // ความสูงของพื้นที่ scroll

        // เพิ่มข้อความกติกา (ทำให้ยาวขึ้นเพื่อทดสอบ scroll)
        this.ruleText = this.add.text(
            scrollAreaX + 15,
            scrollAreaY - 190, // ขยับขึ้นเล็กน้อย
            '1. ผู้ร่วมกิจกรรมจะได้รับสิทธิ์ในการเล่นกิจกรรม \n1 สิทธิ์/วัน\n2. ผู้ร่วมกิจกรรมมีเวลา 30 วินาทีในการเก็บผลไม้\n3. เก็บผลไม้ได้ต่อกันผลละ 1 คะแนน \nเก็บต่อกันได้ 10 คะแนน รับโบนัสเพิ่ม 5 คะแนน\n4. คะแนนและของรางวัลอื่น ๆ ไม่สามารถ\nเปลี่ยนแปลงหรือแลกคืนเป็นเงินสดได้\nโดยของรางวัลที่ได้รับในแต่ละรอบอาจะแตกต่างกัน\n',
            {
                fontSize: '35px',
                fill: '#000000',
                fontFamily: 'Prompt, sans-serif',
                align: 'left',
                lineSpacing: 10,
                wordWrap: { width: scrollAreaWidth - 50 }
            }
        )
        .setOrigin(0.5, 0)
        .setAlpha(1)
        .setDepth(100);

        // เพิ่ม text เข้าไปใน container
        this.textContainer.add(this.ruleText);

        // สร้าง mask สำหรับ scroll area
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(
            scrollAreaX - scrollAreaWidth/2, 
            scrollAreaY - scrollAreaHeight/2, 
            scrollAreaWidth, 
            scrollAreaHeight - 100
        );
        
        const mask = maskShape.createGeometryMask();
        this.textContainer.setMask(mask);

        // สร้าง interactive area สำหรับการ scroll
        this.scrollArea = this.add.rectangle(
            scrollAreaX,
            scrollAreaY,
            scrollAreaWidth,
            scrollAreaHeight
        )
        .setFillStyle(0xffffff, 0) // สีขาว โปร่งใส 100%
        .setInteractive({ useHandCursor: true });

        // ตัวแปรสำหรับ scroll
        this.scrollY = 0;
        this.maxScrollY = Math.max(0, this.ruleText.height - scrollAreaHeight);
        this.isScrolling = false;
        this.lastPointerY = 0;

        // Event handlers สำหรับ scrolling
        this.scrollArea.on('pointerdown', (pointer) => {
            this.isScrolling = true;
            this.lastPointerY = pointer.y;
        });

        this.scrollArea.on('pointermove', (pointer) => {
            if (this.isScrolling) {
                const deltaY = pointer.y - this.lastPointerY;
                this.scrollY = Phaser.Math.Clamp(this.scrollY + deltaY, -this.maxScrollY, 0);
                this.ruleText.y = scrollAreaY - 150 + this.scrollY;
                this.lastPointerY = pointer.y;
            }
        });

        this.scrollArea.on('pointerup', () => {
            this.isScrolling = false;
        });

        this.scrollArea.on('pointerout', () => {
            this.isScrolling = false;
        });

        // Mouse wheel support สำหรับ desktop
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (this.scrollArea && this.scrollArea.getBounds().contains(pointer.x, pointer.y)) {
                this.scrollY = Phaser.Math.Clamp(this.scrollY - deltaY * 0.5, -this.maxScrollY, 0);
                this.ruleText.y = scrollAreaY - 150 + this.scrollY;
            }
        });

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
            this.closeRuleModal();
        });

        // Fade in effects
        this.tweens.add({
            targets: this.backdrop,
            alpha: 0.7,
            duration: 300,
            ease: 'Power2'
        });

        this.tweens.add({
            targets: [this.rule, this.ruleText, this.scrollArea],
            alpha: 1,
            duration: 400,
            delay: 100,
            ease: 'Power2'
        });
    }

    closeRuleModal() {
        // Fade out ก่อนลบ
        this.tweens.add({
            targets: [this.backdrop, this.rule, this.ruleText, this.scrollArea],
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                // ลบ event listeners
                this.input.off('wheel');
                
                // ลบ objects
                this.backdrop.destroy();
                this.rule.destroy();
                this.textContainer.destroy();
                this.scrollArea.destroy();
                this.closeButton.destroy();
                
                // reset ตัวแปร
                this.scrollY = 0;
                this.isScrolling = false;
            }
        });
    }

    update() {

    }
    
}
import { createButtonWithImage } from './utils.js';

export class Game extends Phaser.Scene {

    constructor() {
        super('Game');
        this.score = 0;
        this.gameTime = 30; // เริ่มต้นที่ 30 วินาที
        this.isGameRunning = true;
        this.selectedFruits = [];
        this.fruitGrid = [];
        this.rows = 8;
        this.cols = 6;
        this.cellSize = 180;
        this.gap = 5;
        this.fruits = ['fruit1', 'fruit2', 'fruit3', 'fruit4'];
        this.state = 'playGame'; // เพิ่ม state
    }

    create() {
        // Reset ตัวแปรสำคัญทุกครั้งที่เข้า scene
        this.score = 0;
        this.gameTime = 30; // หรือ 30, 60 ตามต้องการ
        this.isGameRunning = true;
        this.selectedFruits = [];
        this.fruitGrid = [];

        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        // Add background image and scale it to fill the entire screen
        this.add.image(0, 0, 'background-play')
            .setOrigin(0, 0)
            .setDisplaySize(gameWidth, gameHeight);

        // เพิ่ม hand-cursor sprite
        this.handCursor = this.add.image(0, 0, 'hand-cursor')
            .setOrigin(0.2, 0.1)
            .setScale(0.2)
            .setDepth(1000)
            .setVisible(false);

        // UI Elements
        this.createUI(gameWidth);

        // Create fruit grid
        this.createFruitGrid();

        // Setup input handlers
        this.setupInputHandlers();

        // Start timer
        this.startTimer();

        // --- เพิ่มคีย์ลัด S เพื่อ shuffle ---
        this.input.keyboard.on('keydown-S', () => {
            this.shuffleFruits();
        });
    }

    createUI(gameWidth) {
        // Coin background
        this.add.image(
            gameWidth - 280,
            370, 'coin-bg')
            .setOrigin(0.5, 0.5)
            .setScale(1.2)
            .setAlpha(1);

        // Time background
        this.add.image(
            300,
            370, 'time-bg')
            .setOrigin(0.5, 0.5)
            .setScale(1.2)
            .setAlpha(1);

        // Score text
        this.scoreText = this.add.text(
            gameWidth - 200,
            355, '0', { fontSize: '65px', fill: '#ffffff', fontFamily: 'Prompt', fontWeight: '700' })
            .setOrigin(0.5, 0.5)
            .setStroke('#673606', 10);

        // Time text
        this.timeText = this.add.text(
            390,
            355, '00:30', { fontSize: '65px', fill: '#ffffff', fontFamily: 'Prompt', fontWeight: '700' })
            .setOrigin(0.5, 0.5)
            .setStroke('#673606', 10);

        // เพิ่มข้อความแนะนำ
        this.instructionText = this.add.text(
            gameWidth / 2,
            650,
            'ลากผลไม้ชนิดเดียวกันที่ติดกัน (ขั้นต่ำ 3 ช่อง)',
            { fontSize: '35px', fill: '#ffffff', fontFamily: 'Prompt', fontWeight: '700' })
            .setOrigin(0.5, 0.5)
            .setStroke('#673606', 8);
    }

    createFruitGrid() {
        this.fruitGrid = [];

        for (let row = 0; row < this.rows; row++) {
            this.fruitGrid[row] = [];
            for (let col = 0; col < this.cols; col++) {
                // สุ่มชนิดผลไม้
                const fruitKey = Phaser.Utils.Array.GetRandom(this.fruits);

                // คำนวณตำแหน่ง
                const x = 140 + col * (this.cellSize + this.gap);
                const y = 800 + row * (this.cellSize + this.gap);

                // สร้าง sprite ผลไม้
                const fruitSprite = this.add.image(x, y, fruitKey)
                    .setOrigin(0.5)
                    .setDisplaySize(this.cellSize, this.cellSize)
                    .setDepth(100)
                    .setInteractive({ draggable: true });

                // เก็บข้อมูลผลไม้
                const fruitData = {
                    sprite: fruitSprite,
                    type: fruitKey,
                    row: row,
                    col: col,
                    x: x,
                    y: y,
                    isSelected: false
                };

                this.fruitGrid[row][col] = fruitData;
                fruitSprite.fruitData = fruitData;
            }
        }
    }

    setupInputHandlers() {
        // Mouse/Touch events
        this.input.on('pointerdown', this.onPointerDown, this);
        this.input.on('pointermove', this.onPointerMove, this);
        this.input.on('pointerup', this.onPointerUp, this);
    }

    onPointerDown(pointer) {
        if (this.state !== 'playGame') return; // เช็ค state
        const fruit = this.getFruitAtPosition(pointer.x, pointer.y);
        if (fruit) {
            this.startSelection(fruit);
            // แสดง hand-cursor
            this.handCursor.setVisible(true);
            this.handCursor.setPosition(pointer.x, pointer.y);
        }
    }

    onPointerMove(pointer) {
        if (this.state !== 'playGame') return; // เช็ค state
        if (this.selectedFruits.length > 0) {
            const fruit = this.getFruitAtPosition(pointer.x, pointer.y);
            if (fruit && this.canAddToSelection(fruit)) {
                this.addToSelection(fruit);
            }
            // ขยับ hand-cursor ตาม pointer
            this.handCursor.setVisible(true);
            this.handCursor.setPosition(pointer.x, pointer.y);
        }
    }

    onPointerUp(pointer) {
        if (this.state !== 'playGame') return; // เช็ค state
        if (this.selectedFruits.length >= 3) {
            this.processSelection();
        } else {
            this.clearSelection();
        }
        // ซ่อน hand-cursor
        this.handCursor.setVisible(false);
    }

    getFruitAtPosition(x, y) {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const fruit = this.fruitGrid[row][col];
                if (fruit && fruit.sprite.getBounds().contains(x, y)) {
                    return fruit;
                }
            }
        }
        return null;
    }

    startSelection(fruit) {
        this.selectedFruits = [fruit];
        fruit.isSelected = true;
        fruit.sprite.setTexture(fruit.type + '-active');
        this.updateInstructionText();
    }

    canAddToSelection(fruit) {
        if (this.selectedFruits.length === 0) return false;
        if (fruit.isSelected) return false;
        if (fruit.type !== this.selectedFruits[0].type) return false;

        // ตรวจสอบว่าติดกันหรือไม่
        const lastSelected = this.selectedFruits[this.selectedFruits.length - 1];
        const rowDiff = Math.abs(fruit.row - lastSelected.row);
        const colDiff = Math.abs(fruit.col - lastSelected.col);

        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    addToSelection(fruit) {
        if (this.selectedFruits.length < 10) { // จำกัดสูงสุด 10 ช่อง
            this.selectedFruits.push(fruit);
            fruit.isSelected = true;
            fruit.sprite.setTexture(fruit.type + '-active');

            // อัพเดทข้อความแนะนำ
            this.updateInstructionText();
        }
    }

    updateInstructionText() {
        const count = this.selectedFruits.length;
        let instruction = '';

        if (count < 3) {
            instruction = `ลากต่ออีก ${3 - count} ช่องเพื่อได้คะแนน`;
        } else if (count < 10) {
            instruction = `ได้ ${count} คะแนนแล้ว! ลากต่อได้อีก ${10 - count} ช่องเพื่อโบนัส`;
        } else {
            instruction = 'ได้ 10 ช่องแล้ว! ปล่อยเพื่อรับโบนัส 5 คะแนน';
        }

        this.instructionText.setText(instruction);
    }

    processSelection() {
        const count = this.selectedFruits.length;
        let points = count; // 1 คะแนนต่อช่อง

        // โบนัส 5 คะแนนสำหรับ 10 ช่อง
        if (count === 10) {
            points += 5;
        }

        this.score += points;
        this.scoreText.setText(this.score.toString());

        // ลบผลไม้ที่เลือก
        this.removeSelectedFruits();

        // แสดงคะแนนที่ได้
        this.showScorePopup(points);

        // รีเซ็ตการเลือก
        this.selectedFruits = [];

        // --- เพิ่ม: ให้ผลไม้ตกและเติมใหม่ ---
        this.time.delayedCall(200, () => {
            this.dropFruits(() => {
                this.refillFruits();
            });
        });
    }

    removeSelectedFruits() {
        this.selectedFruits.forEach(fruit => {
            // เพิ่มเอฟเฟกต์การหายไป
            this.tweens.add({
                targets: fruit.sprite,
                scaleX: 0,
                scaleY: 0,
                alpha: 0,
                duration: 300,
                ease: 'Power2',
                onComplete: () => {
                    fruit.sprite.destroy();
                }
            });
            this.fruitGrid[fruit.row][fruit.col] = null;
        });
    }

    clearSelection() {
        this.selectedFruits.forEach(fruit => {
            fruit.isSelected = false;
            fruit.sprite.setTexture(fruit.type);
        });
        this.selectedFruits = [];
        this.instructionText.setText('ลากผลไม้ชนิดเดียวกันที่ติดกัน (ขั้นต่ำ 3 ช่อง)');
    }

    showScorePopup(points) {
        // หาตำแหน่งสุดท้ายที่ลากมาถึง
        let lastX = this.cameras.main.width / 2;
        let lastY = this.cameras.main.height / 2;

        if (this.selectedFruits.length > 0) {
            const lastFruit = this.selectedFruits[this.selectedFruits.length - 1];
            lastX = lastFruit.x;
            lastY = lastFruit.y;
        }

        // แสดงคะแนน
        const scorePopup = this.add.text(lastX, lastY, `+${points}`, {
            fontSize: '80px',
            fill: '#ffffff',
            fontFamily: 'Prompt',
            fontWeight: '700'
        })
            .setOrigin(0.5)
            .setStroke('#673606', 10)
            .setScale(0);

        this.tweens.add({
            targets: scorePopup,
            scaleX: 1,
            scaleY: 1,
            duration: 400,
            delay: 100,
            ease: 'Back.easeOut'
        });

        // เอฟเฟกต์ popup ออก
        this.tweens.add({
            targets: [scorePopup],
            scaleX: 0,
            scaleY: 0,
            alpha: 0,
            duration: 300,
            delay: 1000,
            ease: 'Power2',
            onComplete: () => {
                scorePopup.destroy();
            }
        });
    }

    startTimer() {
        this.timer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        if (this.isGameRunning) {
            this.gameTime--;
            const minutes = Math.floor(this.gameTime / 60);
            const seconds = this.gameTime % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            this.timeText.setText(timeString);

            // เปลี่ยนสีเมื่อเหลือเวลาไม่มาก
            if (this.gameTime <= 10) {
                this.timeText.setFill('#ff0000'); // สีแดงเมื่อเหลือเวลาไม่มาก
            } else if (this.gameTime <= 20) {
                this.timeText.setFill('#ffaa00'); // สีส้มเมื่อเหลือเวลาไม่มาก
            }

            // จบเกมเมื่อหมดเวลา
            if (this.gameTime <= 0) {
                this.endGame();
            }
        }
    }

    update() {
        // ตรวจสอบว่ายังมีผลไม้เหลืออยู่หรือไม่
        if (this.isGameRunning) {
            let hasFruits = false;
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.fruitGrid[row][col]) {
                        hasFruits = true;
                        break;
                    }
                }
                if (hasFruits) break;
            }

            if (!hasFruits) {
                this.endGame();
            } else if (!this.canMakeAnyMove()) {
                // ถ้าไม่มีทางลากผลไม้ได้แล้ว ให้สลับตำแหน่งผลไม้
                this.shuffleFruits();
            }
        }
    }

    canMakeAnyMove() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const fruit = this.fruitGrid[row][col];
                if (fruit && this.canStartFromPosition(row, col)) {
                    return true;
                }
            }
        }
        return false;
    }

    canStartFromPosition(row, col) {
        const fruit = this.fruitGrid[row][col];
        if (!fruit) return false;

        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // ขึ้น, ลง, ซ้าย, ขวา
        ];

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (newRow >= 0 && newRow < this.rows &&
                newCol >= 0 && newCol < this.cols) {
                const adjacentFruit = this.fruitGrid[newRow][newCol];
                if (adjacentFruit && adjacentFruit.type === fruit.type) {
                    // ตรวจสอบว่าสามารถลากได้อย่างน้อย 3 ช่องหรือไม่
                    if (this.canMakeChain(row, col, fruit.type, 1)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    canMakeChain(row, col, fruitType, count) {
        if (count >= 3) return true;
        if (count >= 10) return true;

        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1]
        ];

        for (const [dRow, dCol] of directions) {
            const newRow = row + dRow;
            const newCol = col + dCol;

            if (newRow >= 0 && newRow < this.rows &&
                newCol >= 0 && newCol < this.cols) {
                const adjacentFruit = this.fruitGrid[newRow][newCol];
                if (adjacentFruit && adjacentFruit.type === fruitType) {
                    if (this.canMakeChain(newRow, newCol, fruitType, count + 1)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    endGame() {
        this.isGameRunning = false;
        this.state = 'gameOver'; // เปลี่ยน state
        this.timer.remove();

        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        // สร้าง popupWin และ popupWinText ตอนจบเกม
        const popupWin = this.add.image(
            gameWidth / 2,
            gameHeight / 2, 'popup-win'
        )
            .setOrigin(0.5, 0.5)
            .setScale(1.7)
            .setDepth(1000)
            .setAlpha(1);

        const popupWinText = this.add.text(
            gameWidth / 2 + 50,
            gameHeight / 2 + 170, `คุณได้รับ\n${this.score} คะแนน`,
            { fontSize: '55px', fill: '#000000', fontFamily: 'Prompt', fontWeight: '700', align: 'center' }
        )
            .setOrigin(0.5, 0.5)
            .setDepth(1000)
            .setStroke('#000000', 2);

        // สร้าง backdrop มืด
        const backdrop = this.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0x000000
        ).setAlpha(0.8).setDepth(500);

        // แสดงผลคะแนนสุดท้าย
        const finalScoreText = this.add.text(gameWidth / 2, gameHeight / 2 - 150, `เกมจบแล้ว!`, {
            fontSize: '70px',
            fill: '#ffffff',
            fontFamily: 'Prompt',
            fontWeight: '700'
        })
            .setOrigin(0.5)
            .setStroke('#673606', 10);

        const scoreText = this.add.text(gameWidth / 2, gameHeight / 2 - 50, `คะแนนสุดท้าย: ${this.score}`, {
            fontSize: '60px',
            fill: '#ffffff',
            fontFamily: 'Prompt',
            fontWeight: '700'
        })
            .setOrigin(0.5)
            .setStroke('#673606', 10);

        const timeText = this.add.text(gameWidth / 2, gameHeight / 2 + 20, `เวลาเล่น: 00:00`, {
            fontSize: '45px',
            fill: '#ffffff',
            fontFamily: 'Prompt',
            fontWeight: '700'
        })
            .setOrigin(0.5)
            .setStroke('#673606', 8);

        this.closeButton = this.add.circle(
            1100,
            820,
            60,
            0x000000
        )
            .setOrigin(0.7, 0.7)
            .setDepth(102)
            .setAlpha(1)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                // Fade out ก่อนลบ
                this.cameras.main.fadeOut(500, 0, 0, 0);
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.state = 'playGame';
                    this.scene.start('Start');
                });
            });

        // เพิ่มเอฟเฟกต์ confetti
        this.createConfetti();
    }

    createConfetti() {
        const gameWidth = this.cameras.main.width;
        const gameHeight = this.cameras.main.height;

        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(0, gameWidth);
            const y = Phaser.Math.Between(-100, 0);
            const color = Phaser.Math.RND.pick([0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]);

            const confetti = this.add.circle(x, y, 5, color);

            this.tweens.add({
                targets: confetti,
                y: gameHeight + 100,
                x: x + Phaser.Math.Between(-100, 100),
                rotation: Phaser.Math.Between(0, 360),
                duration: Phaser.Math.Between(2000, 4000),
                ease: 'Power2',
                onComplete: () => {
                    confetti.destroy();
                }
            });
        }
    }

    dropFruits(onComplete) {
        let tweens = [];
        for (let col = 0; col < this.cols; col++) {
            let emptySpots = 0;
            for (let row = this.rows - 1; row >= 0; row--) {
                const fruit = this.fruitGrid[row][col];
                if (!fruit) {
                    emptySpots++;
                } else if (emptySpots > 0) {
                    // อัปเดต grid
                    this.fruitGrid[row + emptySpots][col] = fruit;
                    this.fruitGrid[row][col] = null;
                    // อัปเดตข้อมูลใน fruit
                    fruit.row = row + emptySpots;
                    fruit.y = 800 + (row + emptySpots) * (this.cellSize + this.gap);
                    // tween ตกลงมา
                    tweens.push(this.tweens.add({
                        targets: fruit.sprite,
                        y: fruit.y,
                        duration: 200 + 50 * emptySpots,
                        ease: 'Cubic.easeIn'
                    }));
                }
            }
        }
        // รอ tween ทุกตัวเสร็จ
        if (tweens.length > 0) {
            this.time.delayedCall(250, onComplete);
        } else {
            onComplete();
        }
    }

    refillFruits() {
        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                if (!this.fruitGrid[row][col]) {
                    const fruitKey = Phaser.Utils.Array.GetRandom(this.fruits);
                    const x = 140 + col * (this.cellSize + this.gap);
                    const y = 800 + row * (this.cellSize + this.gap);
                    // สร้าง sprite ผลไม้ใหม่ (เริ่มจากด้านบน)
                    const startY = y - 250;
                    const fruitSprite = this.add.image(x, startY, fruitKey)
                        .setOrigin(0.5)
                        .setDisplaySize(this.cellSize, this.cellSize)
                        .setInteractive({ draggable: true });
                    const fruitData = {
                        sprite: fruitSprite,
                        type: fruitKey,
                        row: row,
                        col: col,
                        x: x,
                        y: y,
                        isSelected: false
                    };
                    this.fruitGrid[row][col] = fruitData;
                    fruitSprite.fruitData = fruitData;
                    // tween ร่วงลงมา
                    this.tweens.add({
                        targets: fruitSprite,
                        y: y,
                        duration: 250,
                        ease: 'Bounce.easeOut'
                    });
                }
            }
        }
    }

    shuffleFruits() {
        // ดึงผลไม้ทั้งหมดที่ยังอยู่ใน grid
        let fruits = [];
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.fruitGrid[row][col]) {
                    fruits.push(this.fruitGrid[row][col]);
                }
            }
        }
        // สุ่มตำแหน่งใหม่
        Phaser.Utils.Array.Shuffle(fruits);
        // วางผลไม้กลับลง grid และ tween ไปยังตำแหน่งใหม่
        let i = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.fruitGrid[row][col]) {
                    const fruit = fruits[i++];
                    const newX = 140 + col * (this.cellSize + this.gap);
                    const newY = 800 + row * (this.cellSize + this.gap);
                    // tween ไปยังตำแหน่งใหม่
                    this.tweens.add({
                        targets: fruit.sprite,
                        x: newX,
                        y: newY,
                        duration: 250,
                        ease: 'Cubic.easeInOut'
                    });
                    // อัปเดตข้อมูล
                    fruit.row = row;
                    fruit.col = col;
                    fruit.x = newX;
                    fruit.y = newY;
                    this.fruitGrid[row][col] = fruit;
                }
            }
        }
        // เช็กซ้ำ ถ้ายังไม่มีทางลาก ให้ shuffle ซ้ำ (delay เล็กน้อยเพื่อรอ tween)
        this.time.delayedCall(260, () => {
            if (!this.canMakeAnyMove()) {
                this.shuffleFruits();
            }
        });
    }
}
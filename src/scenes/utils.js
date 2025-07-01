// Utility functions for Phaser Scenes

export function addPressEffect(btn, normalScale, pressedScale) {
    btn.on('pointerdown', () => {
        btn.setScale(pressedScale);
    });
    btn.on('pointerup', () => {
        btn.setScale(normalScale);
    });
    btn.on('pointerout', () => {
        btn.setScale(normalScale);
    });
}

export function createButtonWithImage(scene, x, y, imageKey, label, imageScale = 1, labelStyle = {}, pressedScale = null, callback = null) {
    const btn = scene.add.image(x, y, imageKey)
        .setOrigin(0.5, 0.5)
        .setScale(imageScale)
        .setInteractive({ useHandCursor: true });
    if (pressedScale) {
        addPressEffect(btn, imageScale, pressedScale);
    }
    if (label) {
        scene.add.text(x, y, label, labelStyle).setOrigin(0.5, 0.5);
    }
    if (callback) {
        btn.on('pointerdown', callback);
    }
    return btn;
}

export function createLabelWithBackground(scene, x, y, text, style, paddingX = 32, paddingY = 12, radius = 32, bgColor = 0x888888, bgAlpha = 0.6) {
    // Create a temporary text object to measure width/height
    const tempText = scene.add.text(0, 0, text, style).setVisible(false);
    const textWidth = tempText.width;
    const textHeight = tempText.height;
    tempText.destroy();

    // Draw rounded rectangle background
    const bg = scene.add.graphics();
    const bgWidth = textWidth + paddingX * 2;
    const bgHeight = textHeight + paddingY * 2;
    bg.fillStyle(bgColor, bgAlpha);
    bg.fillRoundedRect(x - bgWidth/2, y - bgHeight/2, bgWidth, bgHeight, radius);

    // Add the text on top of the background
    const label = scene.add.text(x, y, text, style).setOrigin(0.5, 0.5);
    return { bg, label };
} 
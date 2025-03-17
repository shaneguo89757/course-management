const sharp = require('sharp');
const path = require('path');

// 創建桌面版截圖
sharp({
  create: {
    width: 1920,
    height: 1080,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
.composite([
  {
    input: path.join(__dirname, '../public/icons/icon-512x512.png'),
    top: (1080 - 512) / 2,
    left: (1920 - 512) / 2
  }
])
.png()
.toFile(path.join(__dirname, '../public/screenshots/desktop.png'))
.then(() => console.log('Generated desktop screenshot'))
.catch(err => console.error('Error generating desktop screenshot:', err));

// 創建手機版截圖
sharp({
  create: {
    width: 750,
    height: 1334,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 1 }
  }
})
.composite([
  {
    input: path.join(__dirname, '../public/icons/icon-512x512.png'),
    top: (1334 - 512) / 2,
    left: (750 - 512) / 2
  }
])
.png()
.toFile(path.join(__dirname, '../public/screenshots/mobile.png'))
.then(() => console.log('Generated mobile screenshot'))
.catch(err => console.error('Error generating mobile screenshot:', err)); 
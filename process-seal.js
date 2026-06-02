const Jimp = require('jimp');

async function processImage() {
  try {
    const image = await Jimp.read('C:/Users/Admin/.gemini/antigravity/brain/18b55698-1789-474f-8732-f5c18a91e54e/media__1780413675005.png');
    
    // Iterate through all pixels
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is very dark (black background)
      // We will make it transparent
      if (red < 20 && green < 20 && blue < 20) {
        // Set alpha to 0 (transparent)
        this.bitmap.data[idx + 3] = 0;
      }
    });

    await image.writeAsync('public/seal-new.png');
    console.log('Processed image saved to public/seal-new.png');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

processImage();

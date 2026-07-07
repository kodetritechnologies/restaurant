const { Jimp } = require('jimp');

async function removeBackground(imagePath, outputPath) {
    try {
        const image = await Jimp.read(imagePath);
        
        const bgR = image.bitmap.data[0];
        const bgG = image.bitmap.data[1];
        const bgB = image.bitmap.data[2];
        
        console.log(`Background color detected: R:${bgR} G:${bgG} B:${bgB}`);
        
        const tolerance = 40; 

        image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
            const r = this.bitmap.data[idx + 0];
            const g = this.bitmap.data[idx + 1];
            const b = this.bitmap.data[idx + 2];
            
            if (
                Math.abs(r - bgR) <= tolerance &&
                Math.abs(g - bgG) <= tolerance &&
                Math.abs(b - bgB) <= tolerance
            ) {
                this.bitmap.data[idx + 3] = 0;
            }
        });
        
        await image.write(outputPath);
        console.log('Background removed successfully!');
    } catch (err) {
        console.error('Error processing image:', err);
    }
}

const inputPath = 'D:\\CodeTriTechnologies\\Projects\\E-commerce\\restaurant\\public\\assets\\logo.png';
const outputPath = 'D:\\CodeTriTechnologies\\Projects\\E-commerce\\restaurant\\public\\assets\\logo.png';

removeBackground(inputPath, outputPath);

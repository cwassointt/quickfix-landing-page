/*
// scripts/compress-images.mjs
import sharp from "sharp";
import { readdirSync, statSync, writeFileSync, readFileSync } from "fs";
import { join, extname } from "path";

const DIRS = [
    "src/images/hero",
    "src/images/services",
    "src/images/materials",
    "src/images/logo",
    "src/images/repair"
];

const WEBP_OPTIONS = {
    quality: 72,
    effort: 6,
    smartSubsample: true,
};

async function compressDir(dir) {
    let files;
    try {
        files = readdirSync(dir);
    } catch {
        console.log(`⚠ Carpeta no encontrada: ${dir}`);
        return;
    }

    for (const file of files) {
        const filePath = join(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) continue;

        const ext = extname(file).toLowerCase();
        if (ext !== ".webp") continue;

        const originalSize = stat.size;

        try {
            // 1. Read entire file into memory first
            const inputBuffer = readFileSync(filePath);

            // 2. Process from buffer → output buffer (never touches the file directly)
            const outputBuffer = await sharp(inputBuffer)
                .webp(WEBP_OPTIONS)
                .toBuffer();

            // 3. Only write if compression actually helped
            if (outputBuffer.length < inputBuffer.length) {
                writeFileSync(filePath, outputBuffer);
                const saved = (((originalSize - outputBuffer.length) / originalSize) * 100).toFixed(1);
                console.log(`✓ ${file}: ${Math.round(originalSize / 1024)}KB → ${Math.round(outputBuffer.length / 1024)}KB (-${saved}%)`);
            } else {
                console.log(`− ${file}: ya optimizado, se omite`);
            }
        } catch (err) {
            console.error(`✗ Error procesando ${file}: ${err.message}`);
        }
    }
}

console.log("🔧 Comprimiendo imágenes WebP...\n");
for (const dir of DIRS) {
    await compressDir(dir);
}
console.log("\n✅ Compresión completada.");
*/

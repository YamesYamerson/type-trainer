#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🎨 Type Trainer Sprite Generator');
console.log('================================\n');

// Check if we're in the right directory
const projectRoot = path.resolve(__dirname, '..');
const spritesDir = path.join(projectRoot, 'public', 'sprites');

if (!fs.existsSync(spritesDir)) {
    console.log('❌ Sprites directory not found. Creating...');
    fs.mkdirSync(spritesDir, { recursive: true });
}

console.log('📁 Sprites directory:', spritesDir);
console.log('');

// Check existing sprites
const existingSprites = fs.readdirSync(spritesDir).filter(file => file.endsWith('.png'));
console.log('🔍 Existing sprites:', existingSprites.length > 0 ? existingSprites.join(', ') : 'None');
console.log('');

// Instructions for generating sprites
console.log('🎯 To generate sprites automatically:');
console.log('');
console.log('1. 🥚 Generate Egg Sprite:');
console.log('   - Open: http://localhost:5174/egg-sprite-generator.html');
console.log('   - Click "Generate Egg Sprite"');
console.log('   - Click "Download Egg Sprite Sheet"');
console.log('   - Save as: egg-sheet.png in /public/sprites/');
console.log('');

console.log('2. 🐾 Generate Baby Sprite:');
console.log('   - Open: http://localhost:5174/sprite-generator.html');
console.log('   - Design your baby pet sprite');
console.log('   - Export and save as: baby-sheet.png');
console.log('');

console.log('3. 🚀 Generate Other Sprites:');
console.log('   - Use the sprite generator for each evolution stage');
console.log('   - Follow the naming convention: [stage-name]-sheet.png');
console.log('');

// Check if dev server is running
console.log('🔍 Checking if dev server is running...');
exec('lsof -ti:5173,5174', (error, stdout, stderr) => {
    if (stdout.trim()) {
        const ports = stdout.trim().split('\n');
        console.log('✅ Dev server is running on port(s):', ports.join(', '));
        console.log('');
        console.log('🌐 You can now open:');
        console.log('   - Egg Generator: http://localhost:5174/egg-sprite-generator.html');
        console.log('   - Full Generator: http://localhost:5174/sprite-generator.html');
    } else {
        console.log('❌ Dev server is not running.');
        console.log('');
        console.log('🚀 Start the dev server first:');
        console.log('   npm run dev');
        console.log('');
        console.log('Then open the sprite generators in your browser.');
    }
});

console.log('');
console.log('📚 Sprite Requirements:');
console.log('   - Format: PNG');
console.log('   - Frame size: 32x32 pixels (for egg), 32x32+ for others');
console.log('   - Layout: 4 frames per row, 5 rows total');
console.log('   - Total frames: 20 (5 animations × 4 frames each)');
console.log('');
console.log('🎬 Animation Frames:');
console.log('   - Idle: 0-3 (gentle movement)');
console.log('   - Walk Left: 4-7 (rolling left)');
console.log('   - Walk Right: 8-11 (rolling right)');
console.log('   - Happy: 12-15 (bouncing + effects)');
console.log('   - Sad: 16-19 (drooping + sad face)');
console.log('');
console.log('💡 Tip: Start with the egg sprite to test the system!');

# 🎨 Type Trainer Sprite System

## Overview

The Type Trainer now includes an automated sprite generation system that allows users to create custom pet sprites without manual pixel art creation. The system is designed to be user-friendly and generates professional-looking sprites automatically.

## 🥚 What We've Built

### 1. **Egg Sprite Generator** (`/public/egg-sprite-generator.html`)
- **Purpose**: Automatically generates a complete egg sprite sheet
- **Features**: 
  - 20 animation frames covering all pet states
  - Automatic egg design with realistic animations
  - One-click generation and download
  - No manual pixel art required

### 2. **Full Sprite Generator** (`/public/sprite-generator.html`)
- **Purpose**: Manual sprite creation for advanced users
- **Features**:
  - 16x16 pixel grid editor
  - Color palette with 12 colors
  - Frame-by-frame animation creation
  - Export to PNG format

### 3. **Sprite Management Scripts**
- **`npm run sprites`**: Shows sprite system status and instructions
- **`npm run sprites:egg`**: Opens egg generator directly

## 🎬 Sprite Requirements

### Frame Layout
- **Total frames**: 20 (5 animations × 4 frames each)
- **Frame size**: 32×32 pixels (scalable)
- **Layout**: 4 frames per row, 5 rows total
- **Final dimensions**: 128×160 pixels

### Animation Types
1. **Idle** (frames 0-3): Gentle movement, breathing, etc.
2. **Walk Left** (frames 4-7): Moving left animation
3. **Walk Right** (frames 8-11): Moving right animation
4. **Happy** (frames 12-15): Joyful expressions, bouncing, sparkles
5. **Sad** (frames 16-19): Sad expressions, drooping, tears

## 🚀 How to Use

### Quick Start (Recommended)
1. **Start the dev server**: `npm run dev`
2. **Generate egg sprite**: `npm run sprites:egg`
3. **Click "Generate Egg Sprite"**
4. **Click "Download Egg Sprite Sheet"**
5. **Save as `egg-sheet.png` in `/public/sprites/`**

### Manual Sprite Creation
1. Open `/public/sprite-generator.html`
2. Design your sprite frame by frame
3. Use the color palette to create your design
4. Export and save with the correct naming convention

### Testing Your Sprites
1. Open `/public/pet-test.html` to test sprite loading
2. Use the main app to see sprites in action
3. Check browser console for any loading errors

## 📁 File Structure

```
public/
├── sprites/
│   ├── egg-sheet.png          # Egg stage (auto-generated)
│   ├── baby-sheet.png         # Baby stage
│   ├── child-sheet.png        # Child stage
│   ├── teen-sheet.png         # Teen stage
│   ├── young-adult-sheet.png  # Young adult stage
│   ├── adult-sheet.png        # Adult stage
│   ├── master-sheet.png       # Master stage
│   └── legend-sheet.png       # Legend stage
├── egg-sprite-generator.html  # Egg generator
├── sprite-generator.html      # Full sprite editor
└── pet-test.html             # Sprite testing page
```

## 🔧 Technical Details

### Sprite Loading System
- **Automatic fallback**: If sprites fail to load, the system renders fallback graphics
- **Error handling**: Clear error messages when sprites are missing
- **Performance**: Optimized canvas rendering with proper scaling

### Animation System
- **Frame timing**: 150ms per frame (configurable)
- **Smooth transitions**: Automatic animation state management
- **Performance**: Uses `requestAnimationFrame` for smooth 60fps rendering

### Evolution Integration
- **Automatic scaling**: Each evolution stage can have different sizes
- **Seamless transitions**: Sprites automatically update when pets evolve
- **Consistent API**: Same animation system works for all stages

## 🎯 Next Steps

### Phase 1: Egg Testing ✅
- [x] Create egg sprite generator
- [x] Test sprite loading system
- [x] Verify animation works correctly
- [x] Create testing tools

### Phase 2: Baby Sprite
- [ ] Design baby pet appearance
- [ ] Generate baby sprite sheet
- [ ] Test evolution from egg to baby
- [ ] Verify all animations work

### Phase 3: Advanced Sprites
- [ ] Create remaining evolution stages
- [ ] Add special effects and animations
- [ ] Implement sprite customization options
- [ ] Add sprite import/export features

## 🐛 Troubleshooting

### Common Issues

**Sprite not loading:**
- Check file path: `/sprites/[name]-sheet.png`
- Verify file format is PNG
- Check browser console for errors
- Ensure dev server is running

**Animation not working:**
- Verify sprite has 20 frames
- Check frame dimensions (32×32 pixels)
- Ensure animation frames array is correct
- Test with pet-test.html

**Poor quality sprites:**
- Use 32×32 pixel frames minimum
- Avoid anti-aliasing in pixel art
- Use consistent color palette
- Test at different scales

### Debug Tools
- **`npm run sprites`**: System status and instructions
- **`/public/pet-test.html`**: Sprite testing and debugging
- **Browser console**: Error messages and warnings
- **Network tab**: Sprite loading status

## 💡 Tips for Best Results

### Design Principles
1. **Keep it simple**: Complex designs don't scale well
2. **Use consistent colors**: Stick to a limited palette
3. **Test animations**: Ensure frames flow smoothly
4. **Consider scaling**: Design looks good at 1x and 2x scale

### Animation Guidelines
1. **Idle**: Subtle movement, not distracting
2. **Walking**: Clear left/right direction
3. **Happy**: Upward movement, bright colors
4. **Sad**: Downward movement, darker colors

### File Management
1. **Use consistent naming**: `[stage]-sheet.png`
2. **Backup your work**: Keep original files
3. **Test regularly**: Check sprites in the app
4. **Version control**: Track sprite changes

## 🤝 Contributing

### Adding New Sprites
1. Create sprite sheet following the 20-frame format
2. Add to `/public/sprites/` with correct naming
3. Test with `/public/pet-test.html`
4. Update documentation if needed

### Improving Generators
1. Modify generator logic in HTML files
2. Add new color palettes or effects
3. Improve user interface and experience
4. Test with different sprite types

## 📚 Resources

- **Pixel Art Basics**: [Aseprite Tutorial](https://www.aseprite.org/docs/tutorials/)
- **Animation Principles**: [12 Principles of Animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)
- **Color Theory**: [Color Wheel](https://color-wheel-artist.com/)
- **Canvas API**: [MDN Canvas Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

**🎉 Congratulations!** You now have a fully functional sprite system for Type Trainer. Start with the egg sprite to test everything, then move on to creating more complex pet designs. The system is designed to grow with your needs!

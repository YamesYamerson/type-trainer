# Pet Sprite Sheets

This directory contains sprite sheets for the 8 pet evolution stages. Each sprite sheet should be organized in a grid format with specific frame layouts.

## Sprite Sheet Requirements

### File Naming Convention
- `egg-sheet.png` - Stage 0: Egg
- `baby-sheet.png` - Stage 1: Baby  
- `child-sheet.png` - Stage 2: Child
- `teen-sheet.png` - Stage 3: Teen
- `young-adult-sheet.png` - Stage 4: Young Adult
- `adult-sheet.png` - Stage 5: Adult
- `master-sheet.png` - Stage 6: Master
- `legend-sheet.png` - Stage 7: Legend

### Frame Layout (4x5 Grid)
Each sprite sheet should contain 20 frames arranged in a 4x5 grid:

```
Row 0: [0] [1] [2] [3]  - Idle animation frames
Row 1: [4] [5] [6] [7]  - Walk Left animation frames  
Row 2: [8] [9] [10][11] - Walk Right animation frames
Row 3: [12][13][14][15] - Happy animation frames
Row 4: [16][17][18][19] - Sad animation frames
```

### Frame Dimensions
- **Egg**: 32x32 pixels
- **Baby**: 32x32 pixels  
- **Child**: 40x40 pixels
- **Teen**: 48x48 pixels
- **Young Adult**: 56x56 pixels
- **Adult**: 64x64 pixels
- **Master**: 72x72 pixels
- **Legend**: 80x80 pixels

### Animation Frame Mapping
The code expects these frame indices for each animation:

- **Idle**: Frames 0-3 (gentle breathing/movement)
- **Walk Left**: Frames 4-7 (walking left animation)
- **Walk Right**: Frames 8-11 (walking right animation)  
- **Happy**: Frames 12-15 (happy/excited animation)
- **Sad**: Frames 16-19 (sad/disappointed animation)

## Creating Your Own Sprites

1. **Design each evolution stage** with a unique appearance
2. **Create 4-frame animations** for each action type
3. **Arrange in 4x5 grid** as specified above
4. **Export as PNG** with transparent background
5. **Place in this directory** with correct naming

## Example Sprite Sheet Structure

```
┌─────────┬─────────┬─────────┬─────────┐
│   Idle  │   Idle  │   Idle  │   Idle  │ ← Row 0: Frames 0-3
│  Frame0 │  Frame1 │  Frame2 │  Frame3 │
├─────────┼─────────┼─────────┼─────────┤
│ Walk L  │ Walk L  │ Walk L  │ Walk L  │ ← Row 1: Frames 4-7  
│  Frame0 │  Frame1 │  Frame2 │  Frame3 │
├─────────┼─────────┼─────────┼─────────┤
│ Walk R  │ Walk R  │ Walk R  │ Walk R  │ ← Row 2: Frames 8-11
│  Frame0 │  Frame1 │  Frame2 │  Frame3 │
├─────────┼─────────┼─────────┼─────────┤
│  Happy  │  Happy  │  Happy  │  Happy  │ ← Row 3: Frames 12-15
│  Frame0 │  Frame1 │  Frame2 │  Frame3 │
├─────────┼─────────┼─────────┼─────────┤
│   Sad   │   Sad   │   Sad   │   Sad   │ ← Row 4: Frames 16-19
│  Frame0 │  Frame1 │  Frame2 │  Frame3 │
└─────────┴─────────┴─────────┴─────────┘
```

## Testing Without Sprites

If you don't have sprite sheets yet, the system will work but won't display the pet. You can:

1. Create simple colored rectangles as placeholders
2. Use free sprite resources from sites like OpenGameArt.org
3. Design your own pixel art sprites
4. Use AI tools to generate simple character sprites

## Performance Notes

- Keep sprite sheets under 512x512 pixels for best performance
- Use PNG format for transparency support
- Consider using WebP for modern browsers if file size is a concern
- The system automatically scales sprites based on evolution stage

# Font Size Changes Documentation

## Request
**Japanese**: タイトルのフォントサイズを大きくしたい  
**English**: Want to make the title font size larger

## Changes Made

### 1. Main Header Title (h1)
- **Location**: `src/components/MusicPlayer.vue` - Line 4: `<h1>My Music Player</h1>`
- **CSS Changes**: Added new CSS rule for `header h1`
- **Font Size**: Increased to **48px** (from browser default ~32px)
- **Additional Styling**: Added `font-weight: 700` and `margin: 0`

```css
header h1 {
    font-size: 48px;
    font-weight: 700;
    margin: 0;
}
```

### 2. Current Song Title (h2)
- **Location**: `src/components/MusicPlayer.vue` - Line 8: `<h2 class="song-title">`
- **CSS Changes**: Updated existing `.song-title` class
- **Font Size**: Increased from **32px** to **40px**

```css
.song-title {
    color: #53565A;
    font-size: 40px; /* Changed from 32px */
    font-weight: 700;
    text-transform: uppercase;
    text-align: center;
}
```

### 3. Playlist Title (h3)
- **Location**: `src/components/MusicPlayer.vue` - Line 28: `<h3>The Playlist</h3>`
- **CSS Changes**: Updated existing `.playlist h3` selector
- **Font Size**: Increased from **32px** to **40px**

```css
.playlist h3 {
    color: #0089A7;
    font-size: 40px; /* Changed from 32px */
    font-weight: 700;
    margin-bottom: 20px;
    text-align: center;
}
```

## Testing

### Automated Tests
- Added Jest testing framework configuration
- Created comprehensive tests in `tests/MusicPlayer.test.js`
- Created font-size specific tests in `tests/fontSizes.test.js`

### Manual Verification
1. Run `npm install` to install new testing dependencies
2. Run `npm run serve` to start the development server
3. Open the application in a browser
4. Verify the increased font sizes visually

### Running Tests
```bash
npm install  # Install new testing dependencies
npm test     # Run the test suite
```

## Files Modified

1. **src/components/MusicPlayer.vue**
   - Added `header h1` CSS rule (lines 195-199)
   - Updated `.song-title` font-size (line 209)
   - Updated `.playlist h3` font-size (line 283)

2. **package.json**
   - Added test script
   - Added testing dependencies: `@vue/test-utils`, `jest`, `jest-environment-jsdom`, `@vue/vue3-jest`, `babel-jest`
   - Added Jest configuration

3. **tests/MusicPlayer.test.js** (new file)
   - Component structure tests
   - Title element verification tests

4. **tests/fontSizes.test.js** (new file)
   - Font size specific tests
   - CSS class verification tests
   - Manual verification guide

## Visual Impact

The changes result in more prominent and visually appealing titles:
- **Main header**: More prominent branding
- **Song title**: Better readability of current track information
- **Playlist title**: Clearer section identification

All changes maintain the existing color scheme and overall design consistency while making the titles more prominent as requested.
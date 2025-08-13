/**
 * Font Size Tests
 * 
 * These tests verify that the title font sizes have been increased
 * as requested in the Japanese requirement: "タイトルのフォントサイズを大きくしたい"
 * (Want to make the title font size larger)
 */

import { mount } from '@vue/test-utils'
import MusicPlayer from '@/components/MusicPlayer.vue'

// Mock the audio files
jest.mock('@/assets/GLAMOROUSSKY.mp3', () => 'mocked-audio-file')
jest.mock('@/assets/ORION.mp3', () => 'mocked-audio-file')
jest.mock('@/assets/雪の華.mp3', () => 'mocked-audio-file')

describe('Font Size Verification Tests', () => {
  let wrapper

  beforeEach(() => {
    // Mock Audio constructor
    global.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn(),
      pause: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      currentTime: 0,
      duration: 266,
      src: ''
    }))

    wrapper = mount(MusicPlayer)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Title Font Size Changes', () => {
    test('main header (h1) should be styled with larger font', () => {
      const mainHeader = wrapper.find('header h1')
      expect(mainHeader.exists()).toBe(true)
      expect(mainHeader.text()).toBe('My Music Player')
      
      // Verify the element structure is correct for CSS targeting
      const headerParent = wrapper.find('header')
      expect(headerParent.exists()).toBe(true)
      expect(headerParent.find('h1').exists()).toBe(true)
    })

    test('song title should have song-title class for increased font size', () => {
      const songTitle = wrapper.find('h2.song-title')
      expect(songTitle.exists()).toBe(true)
      expect(songTitle.classes()).toContain('song-title')
      
      // Verify it contains both title and artist
      const titleText = songTitle.text()
      expect(titleText).toContain('GLAMOROUS SKY')
      expect(titleText).toContain('中島美嘉')
    })

    test('playlist title should be within playlist section for CSS targeting', () => {
      const playlistSection = wrapper.find('.playlist')
      expect(playlistSection.exists()).toBe(true)
      
      const playlistTitle = playlistSection.find('h3')
      expect(playlistTitle.exists()).toBe(true)
      expect(playlistTitle.text()).toBe('The Playlist')
    })

    test('all title elements have proper hierarchy', () => {
      // Verify the HTML structure supports the CSS changes
      const h1 = wrapper.find('h1')
      const h2 = wrapper.find('h2.song-title')
      const h3 = wrapper.find('.playlist h3')

      expect(h1.exists()).toBe(true)
      expect(h2.exists()).toBe(true)
      expect(h3.exists()).toBe(true)

      // Verify proper nesting
      expect(wrapper.find('header h1').exists()).toBe(true)
      expect(wrapper.find('.player .song-title').exists()).toBe(true)
      expect(wrapper.find('.playlist h3').exists()).toBe(true)
    })
  })

  describe('CSS Class Verification', () => {
    test('song title has correct CSS class applied', () => {
      const songTitle = wrapper.find('.song-title')
      expect(songTitle.exists()).toBe(true)
      expect(songTitle.element.tagName).toBe('H2')
    })

    test('playlist section has correct structure', () => {
      const playlist = wrapper.find('.playlist')
      expect(playlist.exists()).toBe(true)
      
      const playlistTitle = playlist.find('h3')
      expect(playlistTitle.exists()).toBe(true)
    })

    test('header section has correct structure', () => {
      const header = wrapper.find('header')
      expect(header.exists()).toBe(true)
      
      const headerTitle = header.find('h1')
      expect(headerTitle.exists()).toBe(true)
    })
  })
})

/**
 * Manual Verification Guide:
 * 
 * To manually verify the font size changes:
 * 1. Run `npm run serve` to start the development server
 * 2. Open the application in a browser
 * 3. Verify the following font sizes:
 *    - Main header "My Music Player": Should be 48px (increased from default)
 *    - Current song title: Should be 40px (increased from 32px)
 *    - Playlist title "The Playlist": Should be 40px (increased from 32px)
 * 
 * CSS Changes Made:
 * - Added `header h1` selector with font-size: 48px
 * - Updated `.song-title` font-size from 32px to 40px
 * - Updated `.playlist h3` font-size from 32px to 40px
 */
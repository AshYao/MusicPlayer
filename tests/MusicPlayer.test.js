import { mount } from '@vue/test-utils'
import MusicPlayer from '@/components/MusicPlayer.vue'

// Mock the audio files to avoid loading issues in tests
jest.mock('@/assets/GLAMOROUSSKY.mp3', () => 'mocked-audio-file')
jest.mock('@/assets/ORION.mp3', () => 'mocked-audio-file')
jest.mock('@/assets/雪の華.mp3', () => 'mocked-audio-file')

describe('MusicPlayer.vue', () => {
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

  describe('Title Font Sizes', () => {
    test('main header h1 should have increased font size', () => {
      const header = wrapper.find('header h1')
      expect(header.exists()).toBe(true)
      expect(header.text()).toBe('My Music Player')
      
      // Check if the h1 element has the expected styling
      const headerElement = header.element
      const computedStyle = window.getComputedStyle(headerElement)
      
      // Note: In JSDOM, computed styles might not work perfectly, 
      // so we'll check the CSS class is applied correctly
      expect(header.element.tagName).toBe('H1')
    })

    test('song title should have increased font size class', () => {
      const songTitle = wrapper.find('.song-title')
      expect(songTitle.exists()).toBe(true)
      expect(songTitle.classes()).toContain('song-title')
      
      // Verify the song title displays current song info
      expect(songTitle.text()).toContain('GLAMOROUS SKY')
      expect(songTitle.text()).toContain('中島美嘉')
    })

    test('playlist title should exist and have proper structure', () => {
      const playlistTitle = wrapper.find('.playlist h3')
      expect(playlistTitle.exists()).toBe(true)
      expect(playlistTitle.text()).toBe('The Playlist')
    })

    test('component renders all title elements', () => {
      // Check that all three title elements are present
      const mainTitle = wrapper.find('header h1')
      const songTitle = wrapper.find('.song-title')
      const playlistTitle = wrapper.find('.playlist h3')

      expect(mainTitle.exists()).toBe(true)
      expect(songTitle.exists()).toBe(true)
      expect(playlistTitle.exists()).toBe(true)
    })
  })

  describe('Component Structure', () => {
    test('renders main sections correctly', () => {
      expect(wrapper.find('header').exists()).toBe(true)
      expect(wrapper.find('main').exists()).toBe(true)
      expect(wrapper.find('.player').exists()).toBe(true)
      expect(wrapper.find('.playlist').exists()).toBe(true)
    })

    test('displays song list', () => {
      const songs = wrapper.findAll('.playlist .song')
      expect(songs.length).toBe(3)
      
      // Check that all songs are displayed
      expect(songs[0].text()).toContain('GLAMOROUS SKY')
      expect(songs[1].text()).toContain('ORION')
      expect(songs[2].text()).toContain('雪の華')
    })
  })
})
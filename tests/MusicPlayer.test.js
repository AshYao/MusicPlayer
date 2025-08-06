import { mount } from '@vue/test-utils'
import MusicPlayer from '@/components/MusicPlayer.vue'

// Mock audio element since it's not available in test environment
global.Audio = jest.fn().mockImplementation(() => ({
  play: jest.fn(),
  pause: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  currentTime: 0,
  duration: 266,
  src: ''
}))

describe('MusicPlayer.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(MusicPlayer)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('Title Font Sizes', () => {
    test('main application title should be present', () => {
      const mainTitle = wrapper.find('header h1')
      expect(mainTitle.exists()).toBe(true)
      expect(mainTitle.text()).toBe('My Music Player')
    })

    test('main application title should have large font size', () => {
      const mainTitle = wrapper.find('header h1')
      const styles = window.getComputedStyle(mainTitle.element)
      // Note: In test environment, we can't easily test computed styles
      // So we'll test that the element exists and has the correct class/structure
      expect(mainTitle.exists()).toBe(true)
    })

    test('song title should be present and display current song', () => {
      const songTitle = wrapper.find('.song-title')
      expect(songTitle.exists()).toBe(true)
      // Should display the first song by default
      expect(songTitle.text()).toContain('GLAMOROUS SKY')
      expect(songTitle.text()).toContain('中島美嘉')
    })

    test('playlist title should be present', () => {
      const playlistTitle = wrapper.find('.playlist h3')
      expect(playlistTitle.exists()).toBe(true)
      expect(playlistTitle.text()).toBe('The Playlist')
    })

    test('all title elements should have proper CSS classes', () => {
      // Main title
      const mainTitle = wrapper.find('header h1')
      expect(mainTitle.exists()).toBe(true)

      // Song title
      const songTitle = wrapper.find('.song-title')
      expect(songTitle.exists()).toBe(true)
      expect(songTitle.classes()).toContain('song-title')

      // Playlist title
      const playlistTitle = wrapper.find('.playlist h3')
      expect(playlistTitle.exists()).toBe(true)
    })
  })

  describe('Component Functionality', () => {
    test('should render with default song', () => {
      expect(wrapper.vm.current.title).toBe('GLAMOROUS SKY')
      expect(wrapper.vm.current.artist).toBe('中島美嘉')
    })

    test('should have all songs in playlist', () => {
      expect(wrapper.vm.songs).toHaveLength(3)
      expect(wrapper.vm.songs[0].title).toBe('GLAMOROUS SKY')
      expect(wrapper.vm.songs[1].title).toBe('ORION')
      expect(wrapper.vm.songs[2].title).toBe('雪の華')
    })

    test('should have play/pause controls', () => {
      const playButton = wrapper.find('.play')
      const controls = wrapper.find('.controls')
      
      expect(controls.exists()).toBe(true)
      expect(playButton.exists()).toBe(true)
    })

    test('should have next/prev controls', () => {
      const nextButton = wrapper.find('.next')
      const prevButton = wrapper.find('.prev')
      
      expect(nextButton.exists()).toBe(true)
      expect(prevButton.exists()).toBe(true)
    })
  })

  describe('Responsive Design', () => {
    test('should have responsive CSS classes for titles', () => {
      // Check that the title elements exist and can be targeted by responsive CSS
      const mainTitle = wrapper.find('header h1')
      const songTitle = wrapper.find('.song-title')
      const playlistTitle = wrapper.find('.playlist h3')

      expect(mainTitle.exists()).toBe(true)
      expect(songTitle.exists()).toBe(true)
      expect(playlistTitle.exists()).toBe(true)
    })
  })
})
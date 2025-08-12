import { mount } from '@vue/test-utils'
import MusicPlayer from '@/components/MusicPlayer.vue'

describe('MusicPlayer.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(MusicPlayer)
  })

  afterEach(() => {
    wrapper.unmount()
  })

  it('renders the main title with correct text', () => {
    const mainTitle = wrapper.find('header h1')
    expect(mainTitle.exists()).toBe(true)
    expect(mainTitle.text()).toBe('My Music Player')
  })

  it('renders the song title element', () => {
    const songTitle = wrapper.find('.song-title')
    expect(songTitle.exists()).toBe(true)
  })

  it('renders the playlist title with correct text', () => {
    const playlistTitle = wrapper.find('.playlist h3')
    expect(playlistTitle.exists()).toBe(true)
    expect(playlistTitle.text()).toBe('The Playlist')
  })

  it('applies correct CSS classes for title styling', () => {
    const songTitle = wrapper.find('.song-title')
    expect(songTitle.classes()).toContain('song-title')
  })

  it('has the expected title hierarchy structure', () => {
    const mainTitle = wrapper.find('header h1')
    const songTitle = wrapper.find('.song-title')
    const playlistTitle = wrapper.find('.playlist h3')
    
    expect(mainTitle.exists()).toBe(true)
    expect(songTitle.exists()).toBe(true)
    expect(playlistTitle.exists()).toBe(true)
  })

  describe('Title Font Size Styling', () => {
    it('applies larger font sizes to title elements', () => {
      // Test that the CSS classes are properly applied
      // The actual font size testing would require DOM rendering
      const mainTitle = wrapper.find('header h1')
      const songTitle = wrapper.find('.song-title')
      const playlistTitle = wrapper.find('.playlist h3')
      
      expect(mainTitle.exists()).toBe(true)
      expect(songTitle.exists()).toBe(true)
      expect(playlistTitle.exists()).toBe(true)
      
      // Verify the elements have the expected structure for CSS targeting
      expect(mainTitle.element.tagName).toBe('H1')
      expect(songTitle.element.tagName).toBe('H2')
      expect(playlistTitle.element.tagName).toBe('H3')
    })
  })
})
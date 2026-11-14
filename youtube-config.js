/* YouTube — default for every visitor.
   Settings → ▶ YouTube (owner's device) overrides these values on that device.
   To make a choice public for all visitors, copy the "Public config" from Settings → YouTube into this object.
   Never put an API key in this file. */
window.YT_DEFAULT = {
  on: false,          // true = Mobile TV streams YouTube
  mode: 'video',      // 'video' (chosen video) | 'uploads' (latest uploads of the channel) | 'live' (channel live stream)
  channel: '',        // channel link / @handle as typed
  channelId: '',      // UC… channel ID
  videoId: '',        // chosen video ID (11 characters)
  title: '',          // chosen video title (for display)
  mute: true,         // browsers only autoplay muted videos
  loop: true
};

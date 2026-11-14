/* YouTube — default for every visitor.
   Settings → ▶ YouTube (owner's device) overrides these values on that device.
   To make a choice public for all visitors, copy the "Public config" from Settings → YouTube into this object.
   Never put an API key in this file. */
window.YT_DEFAULT = {
  on: true,           // true = Mobile TV streams YouTube
  mode: 'latest',     // 'latest' (newest upload of the channel, auto) | 'video' (chosen video) | 'live' (channel live stream)
  channel: 'Krishnagiri Express News',  // channel link / @handle as typed
  channelId: 'UCMrDnI4ZB7ZYt6h096ViHdg',  // UC… channel ID
  videoId: '',        // chosen video ID (11 characters)
  title: '',          // chosen video title (for display)
  mute: true,         // browsers only autoplay muted videos
  loop: true
};

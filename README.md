# Flix Blender

Infinity ® soundtrack cinema: four full silent features and an experimental five-film clip blender.

## Four full features

| Film | Album |
|---|---|
| The Kid (1921) | Billy Joel — The Stranger |
| The Phantom Carriage (1921) | Pink Floyd — The Division Bell |
| Nosferatu (1922) | Pink Floyd — Animals, 2018 Remix |
| Safety Last! (1923) | Styx — The Grand Illusion |

The Kid uses Archive's Polish-titled Brzdąc print. Captions/intertitles may differ from English editions. This source is large and may be slower to load. Original film sound stays muted. Albums repeat; Start, Pause, Resume and Restart control the pair. Visible source-player controls remain available independently.

## The Blender

Choose The Blender and select 5, 10 or 15 seconds. It rotates through the four films above plus Sherlock Jr. (1924), using Styx's The Grand Illusion as a continuous soundtrack. Each later round uses different offsets. Next clip skips manually. Switching between full features and blender destroys the old music player; within blender mode the music player stays mounted across clip changes.

This is **streamed, timed playback**, not a downloadable edited video or a CapCut export. JavaScript seeks a muted HTML video to a planned offset and advances when movie playback time reaches the clip boundary. Paused or buffering time does not count toward a cut. Boundaries are approximate, limited by media events and browser timing. Each source change may buffer; no gapless or frame-accurate guarantee is made.

The movie provider must support seeking. A 20-second load/seek timeout stops the attempt and shows recovery controls instead of silently looping through failures. No whole film is downloaded by the build process and no movie or song bytes are committed to this repository. The browser still downloads media data to play it.

## Music recovery

Albums use visible YouTube embeds. Full album availability can vary by region, account, device or provider policy. Ads cannot be bypassed and can shift timing. Three album selections have an explicitly labeled opening-track fallback: it repeats only that song, not the entire album. Animals uses the official Pink Floyd full-album video. Next song is available only for album playlists.

## GitHub Pages

Settings → Pages → Deploy from a branch → main → / (root) → Save.

Expected address after Pages is enabled: https://www-infinity4.github.io/Flix-Blender/

The committed index.html, app.js and styles.css need no AI service or build workflow. This repository commit does not verify GitHub Pages activation.

For edits: update app/page.tsx, app/cinema.css or lib/catalog.mjs, run `npm install`, `npm test`, then `npm run build`, and commit source plus rebuilt outputs. Use HTTP(S), not file://, for player embeds.

## Checks performed

- Production build passed.
- Five Node tests passed: source rotation, allowed clip durations, duration bounds, changing offsets, and paused/seeking boundary behavior.
- The four new exact MP4 files each returned HTTP 206, video/mp4, and the requested 1,024-byte range.
- Replacement Journey tracks in Abstractia returned YouTube embed metadata for all ten selections.
- Flix Blender's four opening/fallback video IDs returned appropriate title and artist metadata.
- These are build, logic, transport and metadata checks—not full browser, full-film, full-album or device playback verification. Blender mode is experimental.

## Sources

- [The Kid](https://archive.org/details/Brzdac1921)
- [The Phantom Carriage](https://archive.org/details/ThePhantomCarriage)
- [Nosferatu](https://archive.org/details/nosferatu_201508)
- [Safety Last!](https://archive.org/details/silent-safety-last)
- [Sherlock Jr.](https://archive.org/details/sherlock-jr.-1924)
- [The Stranger album](https://music.youtube.com/playlist?list=OLAK5uy_mLHjM5NsmwIHi3xPaTwme_7YCcgSTjafo)
- [The Division Bell album](https://music.youtube.com/playlist?list=OLAK5uy_nM82AUr-l5OxTITeZBbC6MqZpk9JxD_OE)
- [Animals full album, official Pink Floyd upload](https://www.youtube.com/watch?v=Pi-Fn1M7z1I)
- [The Grand Illusion album](https://music.youtube.com/playlist?list=OLAK5uy_lFT6I-zWsuUsQFxzYAK1IjCpfcQ2O8Bv0)
- [MDN: media currentTime and seeking](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/currentTime)
- [MDN: timeupdate event timing](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/timeupdate_event)

Review exact prints, restorations, scores and provider terms before commercial use. Online availability alone is not a reuse license. No ad-revenue contracts, wallet, token payout system or rights-clearance automation are implemented.

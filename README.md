# Flix Blender

Infinity ® experimental soundtrack cinema: **10 films, 10 Internet Archive music tracks, 15-second cuts**.

## How Program 03 works

- Round 1 plays one 15-second clip from every film in catalog order.
- Round 2 and every later round use a deterministic shuffled order, with no film repeated inside a round.
- Later rounds also seek to different points in each film.
- **Music View** mutes the movie and keeps one independent soundtrack running while picture clips change.
- **Source View** pauses the soundtrack and enables the movie source audio for each 15-second clip.
- Next clip and Next track are independent controls. Restart returns both pools to item 1.
- Movie and music bytes are streamed from Internet Archive; media is not committed to this repository.

## Film pool

The default pool intentionally mixes modern open movies with recognizable public-domain-era cinema:

1. Big Buck Bunny (2008) — Blender Foundation, CC BY 3.0
2. Sintel (2010) — Blender Foundation, CC BY 3.0
3. Tears of Steel (2012) — Blender Foundation, CC BY 3.0
4. Elephants Dream (2006) — Blender open movie, CC BY
5. Nosferatu (1922)
6. Sherlock Jr. (1924)
7. Safety Last! (1923)
8. The Gold Rush (1925)
9. The Phantom of the Opera (1925)
10. Metropolis (1927)

Exact source pages and stream URLs are in `lib/catalog.mjs` and linked directly in the running player.

## Music pool

Ten early public-domain recordings are streamed from Internet Archive, including Mamie Smith, Paul Whiteman, Marion Harris, Alberta Hunter, Selvin's Novelty Orchestra, W. C. Handy, The Southern Four, Ed Meeker, and the 1924 Gershwin/Whiteman recording of *Rhapsody in Blue*. Exact source pages are in `lib/catalog.mjs`.

The first build does **not** use Pink Floyd, Bob Seger, modern commercial songs, or copyrighted Disney feature files simply because the player limits playback to 15 seconds. The 15-second duration is an artistic/technical rule, not an automatic copyright exemption. Licensed modern material can be added to the same catalog later.

## Architecture

`runtime.mjs` is the readable browser source loaded directly by `index.html`. `lib/catalog.mjs` contains the media pool and `lib/clip-plan.mjs` contains sequencing/seek logic. `npm run build` also copies `runtime.mjs` to `app.js` for the portable legacy bundle and rebuilds CSS.

Run:

```sh
npm test
npm run build
```

GitHub Pages serves the committed root files directly.

## Tests

The clip-plan tests cover:

- ordered first ten-film round;
- unique shuffled later rounds;
- exact 15-second normal cuts;
- short-source bounds;
- changing later seek offsets;
- no clip advancement while paused or seeking.

## Sharing and wallet

The existing Control Phi remote, unified wallet, and site-community/share integrations remain loaded by `index.html`.

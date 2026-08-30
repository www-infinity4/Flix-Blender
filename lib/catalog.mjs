export const films = [
  {
    "title": "The Kid",
    "year": 1921,
    "artist": "Billy Joel",
    "album": "The Stranger",
    "list": "OLAK5uy_mLHjM5NsmwIHi3xPaTwme_7YCcgSTjafo",
    "fallback": "cJtL8vWNZ4o",
    "archive": "Brzdac1921",
    "file": "Brzdąc (1921).mp4",
    "note": "Street-level comedy and tenderness meet Billy Joel’s city stories.",
    "edition": "Archive’s Polish-titled print; captions/intertitles may differ from English editions."
  },
  {
    "title": "The Phantom Carriage",
    "year": 1921,
    "artist": "Pink Floyd",
    "album": "The Division Bell",
    "list": "OLAK5uy_nM82AUr-l5OxTITeZBbC6MqZpk9JxD_OE",
    "fallback": "hz9lusYH6Ag",
    "archive": "ThePhantomCarriage",
    "file": "PhantomCarriage_512kb.mp4",
    "note": "Ghostly images and long, reflective guitar passages. A slow-burning midnight pairing.",
    "edition": "Archive print; original film audio muted."
  },
  {
    "title": "Nosferatu",
    "year": 1922,
    "artist": "Pink Floyd",
    "album": "Animals · 2018 Remix",
    "list": "",
    "fallback": "Pi-Fn1M7z1I",
    "archive": "nosferatu_201508",
    "file": "dom-6567newnosferatu.mp4",
    "note": "Long shadows meet the tension and shifting scale of Animals.",
    "edition": "1922 silent film, not a modern remake."
  },
  {
    "title": "Safety Last!",
    "year": 1923,
    "artist": "Styx",
    "album": "The Grand Illusion",
    "list": "OLAK5uy_lFT6I-zWsuUsQFxzYAK1IjCpfcQ2O8Bv0",
    "fallback": "SezLF-RkdXQ",
    "archive": "silent-safety-last",
    "file": "Safety Last!.mp4",
    "note": "Clock-tower suspense with theatrical rock, big hooks, and a sense of lift.",
    "edition": "Harold Lloyd’s 1923 feature."
  },
  {
    "title": "Sherlock Jr.",
    "year": 1924,
    "archive": "sherlock-jr.-1924",
    "file": "Sherlock Jr.1924.mp4",
    "note": "Bonus source for the five-film blend."
  }
];
export const filmURL = (film) => "https://archive.org/download/" + film.archive + "/" + encodeURIComponent(film.file);

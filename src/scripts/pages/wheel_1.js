// Wheel_1 demo page.

var NAMES = {
  anime: "Anime",
  movies: "Movies",
  games: "Games",
  music: "Music",
};

window.goTo = function goTo(key) {
  if (typeof window.showToast === "function") {
    window.showToast("Opening " + NAMES[key] + " …");
  }
  // window.location.href = '/category/' + key;
};


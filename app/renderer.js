//console.log(window.testVariable);
const songListDOM = document.getElementById("songList");

window.songList.forEach((song) => {
  songListDOM.innerHTML +=
    '<li url="' +
    song.url +
    '" name="' +
    song.name +
    '">' +
    song.name +
    '<span id="download"> download</span></li>';
});

let lists = document.getElementsByTagName("LI");

Array.from(lists).forEach((list) => {
  list.addEventListener("click", (e) => {
    let download = {
      name: e.target.parentElement.getAttribute("name"),
      url: e.target.parentElement.getAttribute("url"),
    };
    if (download.name !== null && download.url !== null) {
      window.electronAPI.downloadDiscordSong(download);
    }
  });
});

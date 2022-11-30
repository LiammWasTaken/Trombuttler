//Globals
const contentListDOM = document.getElementById("content-list");
const contentTitle = document.getElementById("content-title");
let loadedSongs = true;

//Load Songs
const loadSongs = function () {
  window.songList.forEach((song) => {
    contentListDOM.innerHTML += `<li class="content" >
    <p>${song.name}</p>
    <div class="container">
      <p class="download" url="${song.url}" name="${song.name}">Download</p>
      <span class="custom-check"></span>
    </div>
  </li>`;
  });
  contentTitle.innerHTML = "Songs";
  loadedSongs = true;
};

//Load Mods
const loadMods = function () {
  contentListDOM.innerHTML = "";
  contentTitle.innerHTML = "Mods";
  loadedSongs = false;
};

//Navigation

//Nav in DOM
let songNav = document.getElementById("songs-link");
let modsNav = document.getElementById("mods-link");

//Song Navigation
songNav.addEventListener("click", () => {
  if (!loadedSongs) {
    loadSongs();
  }
});

//Mod Navigation
modsNav.addEventListener("click", () => {
  if (loadedSongs) {
    loadMods();
  }
});

//Listen For Download Click
document.addEventListener("click", (e) => {
  //Clicked on a download link
  let target = e.target;
  if (target.classList.contains("download")) {
    let download = {
      name: target.getAttribute("name"),
      url: target.getAttribute("url"),
    };
    if (download.name !== null && download.url !== null) {
      window.electronAPI.downloadDiscordSongZip(download);
    }
  }
});

//Listen For Download Completion
window.electronAPI.onDownloadComplete((_event, data) => {
  notify(`Song Downloaded`, `${data.songName} has just been downloaded!`);
});

//By Default Load Songs
loadSongs();

//Helpers
let notifIDTracker = 0;
const notify = function (title, message) {
  let htmlOBJ = `<h3>${title}</h3><p>${message}</p><p class="close-notification" id="close-notification${notifIDTracker}">X</p></div>`;
  let notification = document.getElementById("notification");
  notification.innerHTML = htmlOBJ;
  notification.style.display = "block";

  notification.addEventListener("click", () => {
    notification.style.display = "none";
  });
  notifIDTracker++;
};
//

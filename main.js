const {
  app,
  BrowserWindow,
  ipcMain,
  Notification,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");
const fetch = require("node-fetch");
const AdmZip = require("adm-zip");
const Store = require("electron-store");
const { contextIsolated } = require("process");
const store = new Store();

//GLOBAL VARS
const tempLoc = "./app/temp/temp.zip";
let songsLoc;
const overwriteSongs = true;

//Closes app on window close
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit;
});

app.whenReady().then(() => {
  //Load UI for Windows
  loadUI();

  //Load UI when activated on Mac
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) loadUI;
  });

  //Methods from renderer
  ipcMain.on("downloadDiscordSong", (e, download) => {
    downloadDiscordSong(download);
  });
});

//DOWNLOADS

//Download from discord
function downloadDiscordSong(download) {
  //Fetches file
  fetch(download.url).then((song) => {
    //Create and write temp.zip
    const dest = fs.createWriteStream(tempLoc);
    song.body.pipe(dest);

    //When written
    dest.on("close", () => {
      //Gets temp file as ADMZIP obj
      let tempZip = new AdmZip(tempLoc);
      //Extracts
      tempZip.extractAllToAsync(songsLoc, overwriteSongs, cleanupDownload());
    });
  });
}

//Load the UI
const loadUI = () => {
  if (firstLaunch() === false) {
    songsLoc = store.get("songsLoc");
    console.log(songsLoc);
    //Normal Flow
    const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname + "/app", "preload.js"),
      },
    });

    win.loadFile("./app/app.html");
  } else {
    //Set up prefs
    firstSetup();
  }
};

//First Setup
const firstSetup = function () {
  //Get User Prefs
  const options = {
    type: "question",
    buttons: ["Yes, please", "No, thanks"],
    defaultId: 2,
    title: "First time setup",
    message:
      "Would you like to save custom song folder location for the future?",
    detail:
      "After this box, you will be prompted to find and select your custom songs folder.",
  };

  let response = dialog.showMessageBox(options);

  response.then((r) => {
    //Get the file
    let file = getFileFromUser();
    file.then((f) => {
      if (!f.canceled) {
        //Get the folder path
        songsLoc = f.filePaths[0];
        //Save the info
        if (r.response === 0) {
          store.set("songsLoc", songsLoc);
          store.set("firstLaunch", false);
          loadUI();
        }
      }
    });
  });
};

//Select a file
const getFileFromUser = () => {
  const file = dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  if (!file) {
    return;
  }

  return file;
};

//Clean up download + notifiy of completion
const cleanupDownload = function () {
  if (deleteTempFile()) {
    notify(
      "Success!",
      "Trombuttler successfully downloaded a song, happy boning!"
    );
  }
};

//Delete Temp File
const deleteTempFile = async function () {
  fs.unlink(tempLoc, (err) => {
    if (err) {
      console.error(err);
      return false;
    }
    return true;
  });
};

//Give User Notification
const notify = function (NOTIFICATION_TITLE, NOTIFICATION_BODY) {
  new Notification({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
  }).show();
};

//Is it the first time launching
const firstLaunch = function () {
  //Check if first time launching
  return store.get("firstLaunch");
};

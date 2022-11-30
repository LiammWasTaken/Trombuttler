//REQUIRES//
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
const store = new Store();

//GLOBAL VARIABLES//

const tempLoc = app.getAppPath().toString() + "\\temp.zip";
let songsLoc;
let appWindow;

//MAIN METHOD//
app.whenReady().then(() => {
  //DEV USE RESET STORED DATA
  //store.set("firstLaunch", true);
  //store.set("songsLoc", null);

  //Load UI for Windows
  firstLaunch() ? firstSetup() : loadUI();

  //Load UI when activated on Mac
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      firstLaunch() ? firstSetup() : loadUI();
    }
  });

  //Methods from renderer
  ipcMain.on("downloadDiscordSongZip", (e, download) => {
    downloadDiscordSongZip(download);
  });
});

//Closes app on window close
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

//HELPERS//

//DOWNLOAD SPECIFIC FILE TYPES//

//Download from discord normal zip
function downloadDiscordSongZip(download) {
  //Fetches file
  fetch(download.url).then((song) => {
    //Create and write temp.zip
    const dest = fs.createWriteStream(tempLoc);
    song.body.pipe(dest);

    //When written
    dest.on("close", () => {
      //Gets temp file as ADMZIP obj
      let tempZip = new AdmZip(tempLoc);
      //Object For Info About Download
      let compDownload = {
        songName: download.name,
        type: "zip",
        platform: "discord",
        success: true,
      };
      //Extract, Cleanup And Notify Renderer
      tempZip.extractAllToAsync(songsLoc, true, cleanupDownload(compDownload));
    });
  });
}

//UI METHODS//

//Load the main UI
const loadUI = () => {
  //Set Custom Song Folder Location
  songsLoc == null ? (songsLoc = store.get("songsLoc")) : false;
  appWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname + "/app", "preload.js"),
    },
    autoHideMenuBar: true,
    icon: __dirname + "/icon.ico",
  });
  appWindow.loadFile("./app/app.html");
};

//First Setup UI
const firstSetup = function () {
  //Prepare dialogue
  const fd = {
    type: "question",
    buttons: ["Yes, please", "No, thanks"],
    defaultId: 2,
    title: "First time setup",
    message:
      "Would you like to save the custom song folder location for the future?",
    detail:
      "After this box, you will be prompted to find and select your custom songs folder.",
  };

  let response = dialog.showMessageBox(fd);

  response.then((r) => {
    //Get the file
    let file = getFileFromUser();
    //Wait for file to be chosen
    file.then((f) => {
      //Make sure it didn't crash/close
      if (!f.canceled) {
        //Set the custom songs folder path
        songsLoc = f.filePaths[0];
        //Save the info if user specified
        if (r.response === 0) {
          store.set("songsLoc", songsLoc);
          store.set("firstLaunch", false);
        }
        //Load UI
        loadUI();
      } else {
        //Cancelled  file selection, close the app
        app.quit();
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
    console.log("No file selected");
    return false;
  }

  return file;
};

//MISC Helpers

//Clean up download + notifiy of completion
const cleanupDownload = function (compDownload) {
  if (deleteTempFile()) {
    notify(
      "Success!",
      "Trombuttler successfully downloaded a song, happy boning!"
    );
    appWindow.webContents.send(`download-complete`, compDownload);
  } else {
    notify(
      "Error!",
      "Something went wrong when downloading your song, please try again."
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

//Check if it's the first time launching. Unnecsesary but looks nicer with one word rather than 3 lol
const firstLaunch = function () {
  //Check if first time launching
  return store.get("firstLaunch");
};

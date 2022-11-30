const { contextBridge, ipcRenderer } = require("electron");

//contextBridge.exposeInMainWorld("testVariable", "hey jade!");
const downloads = [
  {
    name: "Payphone",
    url: "https://cdn.discordapp.com/attachments/1024214552151347231/1045041831978729482/payphonemaroon5.zip",
  },
  {
    name: "FiveMoreHours",
    url: "https://cdn.discordapp.com/attachments/1024214552151347231/1044515779565064242/fivemorehours.zip",
  },
  {
    name: "Oddtaxi",
    url: "https://cdn.discordapp.com/attachments/1024214552151347231/1045866878389715085/Oddtaxi.zip",
  },
];

contextBridge.exposeInMainWorld("songList", downloads);

contextBridge.exposeInMainWorld("electronAPI", {
  downloadDiscordSong: (download) =>
    ipcRenderer.send("downloadDiscordSong", download),
});

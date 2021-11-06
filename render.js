// 1. Require the module
const TabGroup = require("electron-tabs");

// 2. Define the instance of the tab group (container)
let tabGroup = new TabGroup();
let tab = tabGroup.addTab({
  title: "Penglyfe",
  src: "http://play.penglyfe.com",
  visible: true
});
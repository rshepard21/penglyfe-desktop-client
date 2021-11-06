/*// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
*/


function redirect() {window.location.href = 'http://play.penglyfe.com';}
window.addEventListener('DOMContentLoaded', () => {
  var url = window.location.href;
  if (url.includes('play.penglyfe.com') === false) {redirect();}
});

window.addEventListener('DOMContentLoaded', () => {
  const selector = document.querySelector('body');
  const my_awesome_script = document.createElement('script');

  my_awesome_script.setAttribute('src','./render.js');

  alert(my_awesome_script);

  document.head.appendChild(my_awesome_script);
});

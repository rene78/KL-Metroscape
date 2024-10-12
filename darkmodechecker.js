const isDark = window.matchMedia("(prefers-color-scheme:dark)").matches;
if (isDark) setDark();

//Change website to dark mode if dark mode is set in OS
function setDark() {
  console.log('Dark mode set in OS! Change color scheme');
  document.body.classList.toggle("dark-mode");
}
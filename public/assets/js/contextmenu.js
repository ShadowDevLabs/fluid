let activeMenu;

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (e.target.getAttribute("data-context")) {
  }
});

document.addEventListener("click", (e) => {
  if (e.target != activeMenu || e.target.parent != activeMenu) {
  }
});

const show = (menu, pos) => {
  menu.style.left = pos.x;
  menu.style.top = pos.y;
  menu.style.display = block;
  menu.setAttribute("shown", true);
  activeMenu = menu;
};

const hide = (menu) => {
  menu.style.display = none;
  menu.setAttribute("shown", false);
  activeMenu = undefined;
};

let activeMenu;


document.addEventListener("click", (e) => {
  const menu = document.getElementById("options-menu");
  if (menu !== e.target && e.target.id !== "menu-btn")
    menu.style.display = "none";

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

function openMenu() {
  const menu = document.getElementById("options-menu");
  const isShown = menu.style.display === "block";
  menu.style.display = isShown ? "none" : "block";

  if (!isShown) {
    document.addEventListener("click", closeMenu);
  }
}

function closeMenu(event) {
  const menu = document.getElementById("options-menu");
  if (menu !== event.target && event.target.id !== "menu-btn")
    document.removeEventListener("click", closeMenu);
}


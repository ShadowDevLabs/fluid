let tips = [
  "Snails have teeth.",
  "You would need to lick a stamp roughly 25,000 times to reach your daily calorie intake.",
  "Octopuses have three hearts and blue blood.",
  "Honey never spoils; archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.",
  "A group of flamingos is called a 'flamboyance.'",
  "Bananas are berries, but strawberries aren't.",
  "A day on Venus is longer than a year on Venus.",
  "Sharks existed before trees did.",
  "Cows have best friends and get stressed when separated from them.",
  "Sloths can hold their breath for up to 40 minutes underwater.",
  "There's a species of jellyfish that is biologically immortal.",
  "Peanuts are not nuts; they're legumes.",
  "Wombat poop is cube-shaped.",
  "A blue whale's heart is about the size of a small car.",
  "Octopuses can taste with their arms.",
  "Butterflies can taste with their feet.",
  "A group of owls is called a 'parliament.'",
  "Some cats are allergic to humans.",
  "The world's largest desert is Antarctica.",
  "Humans share 50% of their DNA with bananas.",
  "Cheetahs can accelerate from 0 to 60 mph in just a few seconds.",
  "Some species of turtles can breathe through their butts."
];


let percent = 0; 
const interval = setInterval(update, 250);
const tip = tips[Math.floor(Math.random() * 12)]; 

window.onload = () => setTimeout(stopLoad, 500);

function stopLoad() {
  Array.from(document.getElementById("initial-loading-bar").children).forEach(
    (element) => {
      element.classList.add("loaded");
    }
  );
  setTimeout(() => {
    clearInterval(interval);
    document.getElementById("loading-page").remove();
  }, 500);
}

function update() {
  loadBar();
  document.getElementById("loading-tip").textContent = tip;
}

function loadBar() {
  const cells = Array.from(
    document.getElementById("initial-loading-bar").children
  ).reverse();
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains("loaded")) {
      nextCell = cells[i];
    }
  }

  nextCell.classList.add("loaded");
}

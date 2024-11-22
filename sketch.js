// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let moduleImages;
let planetImages;


function preload() {
  moduleImages = {
    booster: loadImage("assets/modules/booster.png"),
    cargo: loadImage("assets/modules/cargo.png"),
    eco_booster: loadImage("assets/modules/eco_booster.png"),
    hub_booster: loadImage("assets/modules/hub_booster.png"),
    hub: loadImage("assets/modules/hub.png"),
    landing_booster: loadImage("assets/modules/landing_booster.png"),
    landing_gear: loadImage("assets/modules/landing_gear.png"),
    power_hub: loadImage("assets/modules/power_hub.png"),
    solar_panel: loadImage("assets/modules/solar_panel.png"),
    super_booster: loadImage("assets/modules/super_booster.png"),
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  circle(mouseX,mouseY,100);
}

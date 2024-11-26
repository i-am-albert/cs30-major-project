// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// image variables
let moduleImages;
let planetImages;

// state variables
let started = false;

// player variables
let x;
let y;
let xpos;
let ypos;

class Module {
  constructor(posx,posy,posx2,posy2,moduleImage) {
    this.x=x;
    this.y=y;

  }
  display() {
    image(moduleImage,this.x,this.y);
  }
}

let moduleArray = []

function preload() {
  moduleImages = {
    booster: loadImage("assets/modules/booster.png"),
    cargo: loadImage("assets/modules/cargo.png"),
    eco_booster: loadImage("assets/modules/eco_booster.png"),
    hub_booster: loadImage("assets/modules/hub_booster.png"),
    heart_hub: loadImage("assets/modules/heart_hub.png"),
    hub: loadImage("assets/modules/hub.png"),
    landing_booster: loadImage("assets/modules/landing_booster.png"),
    landing_gear: loadImage("assets/modules/landing_gear.png"),
    power_hub: loadImage("assets/modules/power_hub.png"),
    solar_panel: loadImage("assets/modules/solar_panel.png"),
    super_booster: loadImage("assets/modules/super_booster.png"),
  };
  planetImages = {
    earth: loadImage("assets/planets/earth.png"),
  };
}

function displayStartScreen() {
  fill("white");
  text("click to start",width/2,height/2);
}

function displayModules() {
  for (let module of moduleArray) {
    module.move();
    module.display();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  moduleArray.push(new Module(width/2,height/2,moduleImages.heart_hub));
}

function draw() {
  background(0);
  if (started) {
    displayModules();
  }
  else if (!started) {
    displayStartScreen();
  }
}

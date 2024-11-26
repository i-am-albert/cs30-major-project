// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

// constants
let MODULE_SIZE = 64;

// image variables
let moduleImages;
let planetImages;

// state variables
let started = false;

// player variables
let shipx;
let shipy;
let shipdx = 0;
let shipdy = 0;
let shipRotation = 0;
let shipdr = 0;

class Module {
  constructor(posx,posy,posx2,posy2,type) {
    this.type=type;
    this.x=posx;
    this.y=posy;
  }
  display() {
    rotate(shipRotation);
    image(moduleImages.heart_hub,width/2+this.x*MODULE_SIZE,height/2+this.x*MODULE_SIZE,this.x*MODULE_SIZE+MODULE_SIZE,this.x*MODULE_SIZE+MODULE_SIZE);
  }
}

let moduleArray = [];

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
    // module.move();
    module.display(module.type,0,0);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  moduleArray.push(new Module(0,0,moduleImages.heart_hub));
}

function draw() {
  background(0);
  if (started) {
    displayModules();
    shipMovement();
  }
  else if (!started) {
    displayStartScreen();
  }
}

function mousePressed() {
  started = true;
}

function keyPressed() {
  if (started) {
    if (key === "a") {
      shipdr+=0.01;
    }
    if (key === "d") {
      shipdr-=0.01;
    }
  }
}

function shipMovement() {
  shipx+=shipdx;
  shipy+=shipdy;
  shipRotation+=shipdr;
}
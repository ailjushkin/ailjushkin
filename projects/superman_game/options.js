const OPTIONS = {
  superSpeed: 2,                 // 1. horizontal speed of buildings/scroll
  buildingGapRange: [400, 500],  // 2. min/max horizontal distance between buildings
  flapStrength: -8,              // 3. upward velocity applied on space press
  verticalGap: 500,              // 4. free space between top and bottom building
  supermanImageUrl: "superman.png",        // 5. url to png file for superman figure (null = draw default shape)
  supermanHeigth: 40,
  supermanWidth: 80,
  rain: true,                       // 8. enable rain effect
  windowFlicker: true,              // 9. windows randomly turn on/off slowly
  moon: true,                       // 10. show moon in background
  moonSize: 50,                     // 11. radius of the moon in px
  autopilot: true                   // 12. before game starts, superman auto-flies to avoid buildings
};

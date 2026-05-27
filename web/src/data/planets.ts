export interface Moon {
  name: string;
  orbitRadius: number; // pixels from planet center
  size: number; // pixel radius
  color: string;
  orbitalPeriod: number; // days
}

export interface PlanetData {
  name: string;
  type: "star" | "terrestrial" | "gas giant" | "ice giant" | "dwarf planet";
  color: string;
  colorSecondary?: string;
  distanceAU: number;
  orbitalPeriodDays: number;
  eccentricity: number;
  radius: number; // display radius in pixels (scaled for visibility)
  diameterKm: number;
  massEarths: number;
  knownMoons: number;
  temperatureRange: string;
  atmosphere: string;
  funFacts: string[];
  moons: Moon[];
  hasRings?: boolean;
  ringColor?: string;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
}

export const SUN_DATA: PlanetData = {
  name: "Sun",
  type: "star",
  color: "#FDB813",
  colorSecondary: "#FF6B00",
  distanceAU: 0,
  orbitalPeriodDays: 0,
  eccentricity: 0,
  radius: 28,
  diameterKm: 1392700,
  massEarths: 332946,
  knownMoons: 0,
  temperatureRange: "5,500 C (surface) to 15,000,000 C (core)",
  atmosphere: "73% Hydrogen, 25% Helium, 2% heavier elements",
  funFacts: [
    "The Sun contains 99.86% of all mass in the solar system.",
    "Light from the Sun takes about 8 minutes to reach Earth.",
    "The Sun is roughly 4.6 billion years old and is halfway through its life.",
    "About 1.3 million Earths could fit inside the Sun.",
  ],
  moons: [],
};

export const PLANETS: PlanetData[] = [
  {
    name: "Mercury",
    type: "terrestrial",
    color: "#8C7E6F",
    colorSecondary: "#6B5F52",
    distanceAU: 0.387,
    orbitalPeriodDays: 88,
    eccentricity: 0.2056,
    radius: 4,
    diameterKm: 4879,
    massEarths: 0.055,
    knownMoons: 0,
    temperatureRange: "-180 C to 430 C",
    atmosphere: "Virtually none. Traces of oxygen, sodium, hydrogen, helium",
    funFacts: [
      "Mercury is the smallest planet in our solar system.",
      "A day on Mercury (sunrise to sunrise) lasts 176 Earth days.",
      "Despite being closest to the Sun, it is not the hottest planet.",
      "Mercury has no atmosphere to retain heat, causing extreme temperature swings.",
    ],
    moons: [],
  },
  {
    name: "Venus",
    type: "terrestrial",
    color: "#E8CDA0",
    colorSecondary: "#C4A46E",
    distanceAU: 0.723,
    orbitalPeriodDays: 225,
    eccentricity: 0.0068,
    radius: 6,
    diameterKm: 12104,
    massEarths: 0.815,
    knownMoons: 0,
    temperatureRange: "462 C (average surface)",
    atmosphere: "96.5% Carbon dioxide, 3.5% Nitrogen, traces of sulfur dioxide",
    funFacts: [
      "Venus rotates backwards compared to most other planets.",
      "A day on Venus is longer than its year (243 vs 225 Earth days).",
      "Venus is the hottest planet due to its extreme greenhouse effect.",
      "The atmospheric pressure on Venus is 92 times that of Earth.",
    ],
    moons: [],
  },
  {
    name: "Earth",
    type: "terrestrial",
    color: "#4B8BBE",
    colorSecondary: "#3A6B4E",
    distanceAU: 1.0,
    orbitalPeriodDays: 365.25,
    eccentricity: 0.0167,
    radius: 6,
    diameterKm: 12756,
    massEarths: 1.0,
    knownMoons: 1,
    temperatureRange: "-89 C to 57 C",
    atmosphere: "78% Nitrogen, 21% Oxygen, 1% Argon and trace gases",
    funFacts: [
      "Earth is the only known planet to harbor life.",
      "71% of Earth's surface is covered in water.",
      "Earth's magnetic field protects us from solar radiation.",
      "Earth is the densest planet in the solar system.",
    ],
    moons: [
      {
        name: "Moon",
        orbitRadius: 14,
        size: 2,
        color: "#C0C0C0",
        orbitalPeriod: 27.3,
      },
    ],
  },
  {
    name: "Mars",
    type: "terrestrial",
    color: "#C1440E",
    colorSecondary: "#8B3A0E",
    distanceAU: 1.524,
    orbitalPeriodDays: 687,
    eccentricity: 0.0934,
    radius: 5,
    diameterKm: 6792,
    massEarths: 0.107,
    knownMoons: 2,
    temperatureRange: "-140 C to 20 C",
    atmosphere: "95.3% Carbon dioxide, 2.7% Nitrogen, 1.6% Argon",
    funFacts: [
      "Mars has the tallest volcano in the solar system: Olympus Mons (21.9 km).",
      "Mars has seasons like Earth because of a similar axial tilt.",
      "The red color comes from iron oxide (rust) on its surface.",
      "Mars has the largest canyon: Valles Marineris (4,000 km long).",
    ],
    moons: [
      {
        name: "Phobos",
        orbitRadius: 11,
        size: 1.5,
        color: "#8B7D6B",
        orbitalPeriod: 0.32,
      },
      {
        name: "Deimos",
        orbitRadius: 15,
        size: 1,
        color: "#9B8B7B",
        orbitalPeriod: 1.26,
      },
    ],
  },
  {
    name: "Jupiter",
    type: "gas giant",
    color: "#C88B3A",
    colorSecondary: "#A0522D",
    distanceAU: 5.203,
    orbitalPeriodDays: 4333,
    eccentricity: 0.0489,
    radius: 16,
    diameterKm: 142984,
    massEarths: 317.8,
    knownMoons: 95,
    temperatureRange: "-145 C (cloud tops)",
    atmosphere: "90% Hydrogen, 10% Helium, traces of methane and ammonia",
    funFacts: [
      "Jupiter's Great Red Spot is a storm larger than Earth, raging for 350+ years.",
      "Jupiter has the strongest magnetic field of any planet.",
      "Jupiter acts as a cosmic vacuum cleaner, deflecting asteroids from inner planets.",
      "You could fit all other planets inside Jupiter and still have room.",
    ],
    moons: [
      {
        name: "Io",
        orbitRadius: 24,
        size: 2,
        color: "#E8D44D",
        orbitalPeriod: 1.77,
      },
      {
        name: "Europa",
        orbitRadius: 29,
        size: 1.8,
        color: "#C8B89A",
        orbitalPeriod: 3.55,
      },
      {
        name: "Ganymede",
        orbitRadius: 35,
        size: 2.5,
        color: "#8B8378",
        orbitalPeriod: 7.15,
      },
      {
        name: "Callisto",
        orbitRadius: 42,
        size: 2.2,
        color: "#6B5F52",
        orbitalPeriod: 16.69,
      },
    ],
  },
  {
    name: "Saturn",
    type: "gas giant",
    color: "#E8D08C",
    colorSecondary: "#C4A84E",
    distanceAU: 9.537,
    orbitalPeriodDays: 10759,
    eccentricity: 0.0565,
    radius: 14,
    diameterKm: 120536,
    massEarths: 95.2,
    knownMoons: 146,
    temperatureRange: "-178 C (cloud tops)",
    atmosphere: "96% Hydrogen, 3% Helium, traces of methane and ammonia",
    funFacts: [
      "Saturn's rings are made of billions of ice and rock particles.",
      "Saturn is the least dense planet — it would float in water.",
      "Saturn's moon Titan has a thicker atmosphere than Earth.",
      "Winds on Saturn can reach up to 1,800 km/h.",
    ],
    moons: [
      {
        name: "Titan",
        orbitRadius: 26,
        size: 2.5,
        color: "#D4A03C",
        orbitalPeriod: 15.95,
      },
      {
        name: "Enceladus",
        orbitRadius: 20,
        size: 1.5,
        color: "#F0F0F0",
        orbitalPeriod: 1.37,
      },
    ],
    hasRings: true,
    ringColor: "rgba(210, 180, 120, 0.4)",
    ringInnerRadius: 19,
    ringOuterRadius: 30,
  },
  {
    name: "Uranus",
    type: "ice giant",
    color: "#72B8D4",
    colorSecondary: "#4A9AB8",
    distanceAU: 19.19,
    orbitalPeriodDays: 30687,
    eccentricity: 0.0457,
    radius: 10,
    diameterKm: 51118,
    massEarths: 14.5,
    knownMoons: 28,
    temperatureRange: "-224 C (cloud tops)",
    atmosphere: "83% Hydrogen, 15% Helium, 2% Methane (gives blue-green color)",
    funFacts: [
      "Uranus rotates on its side with an axial tilt of 98 degrees.",
      "Uranus was the first planet discovered with a telescope (1781).",
      "Uranus has faint rings discovered in 1977.",
      "A season on Uranus lasts 21 Earth years.",
    ],
    moons: [],
  },
  {
    name: "Neptune",
    type: "ice giant",
    color: "#3A5BA0",
    colorSecondary: "#1E3A6E",
    distanceAU: 30.07,
    orbitalPeriodDays: 60190,
    eccentricity: 0.0113,
    radius: 10,
    diameterKm: 49528,
    massEarths: 17.1,
    knownMoons: 16,
    temperatureRange: "-214 C (cloud tops)",
    atmosphere: "80% Hydrogen, 19% Helium, 1% Methane (deep blue color)",
    funFacts: [
      "Neptune has the strongest winds in the solar system (up to 2,100 km/h).",
      "Neptune was predicted mathematically before it was observed.",
      "Neptune's moon Triton orbits in the opposite direction of the planet's rotation.",
      "It takes 165 Earth years for Neptune to orbit the Sun once.",
    ],
    moons: [],
  },
];

export const PLUTO: PlanetData = {
  name: "Pluto",
  type: "dwarf planet",
  color: "#C4A882",
  colorSecondary: "#8B7D6B",
  distanceAU: 39.48,
  orbitalPeriodDays: 90560,
  eccentricity: 0.2488,
  radius: 3,
  diameterKm: 2377,
  massEarths: 0.002,
  knownMoons: 5,
  temperatureRange: "-233 C to -223 C",
  atmosphere: "Thin: Nitrogen, Methane, Carbon monoxide (expands near perihelion)",
  funFacts: [
    "Pluto was reclassified as a dwarf planet in 2006.",
    "Pluto's largest moon Charon is so large they orbit a shared center of gravity.",
    "Pluto has a heart-shaped glacier called Tombaugh Regio.",
    "New Horizons flew by Pluto in 2015 after a 9.5-year journey.",
  ],
  moons: [
    {
      name: "Charon",
      orbitRadius: 10,
      size: 2,
      color: "#9B8B7B",
      orbitalPeriod: 6.39,
    },
  ],
};

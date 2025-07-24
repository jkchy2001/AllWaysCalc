
export const newRegimeSlabs = [
  { limit: 300000, rate: 0 },
  { limit: 600000, rate: 5 },
  { limit: 900000, rate: 10 },
  { limit: 1200000, rate: 15 },
  { limit: 1500000, rate: 20 },
  { limit: Infinity, rate: 30 },
];

export const oldRegimeSlabs = {
    below60: [
        { limit: 250000, rate: 0 },
        { limit: 500000, rate: 5 },
        { limit: 1000000, rate: 20 },
        { limit: Infinity, rate: 30 },
    ],
    '60to80': [
        { limit: 300000, rate: 0 },
        { limit: 500000, rate: 5 },
        { limit: 1000000, rate: 20 },
        { limit: Infinity, rate: 30 },
    ],
    above80: [
        { limit: 500000, rate: 0 },
        { limit: 1000000, rate: 20 },
        { limit: Infinity, rate: 30 },
    ],
};

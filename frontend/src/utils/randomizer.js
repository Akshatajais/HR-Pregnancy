const ranges = {
  Low: {
    age: [22, 32],
    systolic_bp: [100, 118],
    heart_rate: [65, 80],
    sleep_hours: [7.2, 9],
    stress_level: [1, 4],
    hydration: [2.2, 3.0],
    activity_minutes: [60, 120],
  },
  Moderate: {
    age: [26, 36],
    systolic_bp: [118, 135],
    heart_rate: [78, 95],
    sleep_hours: [6.2, 7.5],
    stress_level: [4, 7.2],
    hydration: [1.6, 2.4],
    activity_minutes: [30, 70],
  },
  High: {
    age: [30, 45],
    systolic_bp: [135, 158],
    heart_rate: [90, 115],
    sleep_hours: [4.5, 6.2],
    stress_level: [7.2, 10],
    hydration: [0.8, 1.6],
    activity_minutes: [0, 30],
  },
}

const pickRange = (label) => ranges[label]

const randomBetween = (min, max, precision = 1) => {
  const value = min + Math.random() * (max - min)
  return Number(value.toFixed(precision))
}

export const generateRandomCase = (states) => {
  const tiers = ['Low', 'Moderate', 'High']
  const bucket = tiers[Math.floor(Math.random() * tiers.length)]
  const selectedRange = pickRange(bucket)
  const state = states?.length ? states[Math.floor(Math.random() * states.length)] : ''

  const formValues = Object.entries(selectedRange).reduce(
    (acc, [key, [min, max]]) => ({
      ...acc,
      [key]: randomBetween(min, max, key === 'activity_minutes' ? 0 : 1),
    }),
    {},
  )

  return {
    preset: bucket,
    form: {
      ...formValues,
      state,
    },
  }
}

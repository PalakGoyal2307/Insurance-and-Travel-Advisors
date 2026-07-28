import { Counter } from '../models/Counter.js'

export const generateUserCode = async () => {
  const counter = await Counter.findOneAndUpdate(
    { key: 'user_code' },
    { $inc: { value: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  return `USER${String(counter.value).padStart(3, '0')}`
}

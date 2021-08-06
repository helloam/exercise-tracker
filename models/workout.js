const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const workoutSchema = new Schema({
  day: {
    type: Date,
    default: Date.now
  },
  exercises: [
    {
      type: { type: String, required: true },
      name: { type: String, required: true },
      reps: Number,
      sets: Number,
      weight: Number,
      distance: Number,
      duration: Number
    }
  ]
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;
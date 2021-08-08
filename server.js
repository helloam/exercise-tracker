const express = require('express');
const mongoose = require('mongoose');
const logger = require('morgan');
const path = require('path');
const db = require('./models');
const Workout = require('./models/workout');

const PORT = process.env.PORT || 3000

const app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));

mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost/workout',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  }
);

//HTML Routes//
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get("/exercise", (req, res) => {
  res.sendFile(path.join(__dirname, './public/exercise.html'));
});

app.get("/stats", (req, res) => {
  res.sendFile(path.join(__dirname, './public/stats.html'));
});

//API Routes//
//Get all workouts
app.get("/api/workouts/", (req,res) =>{
  Workout.aggregate(
      [{
        $addFields : {totalDuration : {$sum: "$exercises.duration"}}
      }]
    )
    .then(data =>{
      res.json(data);
    })
    .catch(err =>{
      res.status(400).json(err)
    })
});


//Create a new workout
app.post('/api/workouts', ({ body }, res) => {
  db.Workout.create(body)
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.json(err);
    });
});

//Getting workout data for the dashboard page
app.get('/api/workouts/range', (req, res) => {
  Workout.aggregate(
    [{
      $addFields: {
        totalDuration: {$sum: "$exercises.duration"}}
      }]
  )
  .sort({day : -1})    
    .limit(5)
    .then(dbWorkout =>{
      res.json(dbWorkout);
    })
    .catch((err) => {
      res.json(err);
    });
});

//Updating an existing workout
app.put('/api/workouts/:id', (req, res) => {
  db.Workout.findByIdAndUpdate(req.params.id, {
    $push: { exercises: req.body }
  })
    .then(dbWorkout => {
      res.json(dbWorkout);
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

//Deleting a workout
app.delete('/api/workouts', (req, res) => {
    db.Workout.findByIdAndDelete(req.body.id)
    .then(() => {
      res.json(true)
    })
    .catch (err => {
      res.json(err);
    });
  });

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
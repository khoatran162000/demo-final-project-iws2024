// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose
  .connect(
    "mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

// Define Movie schema
const movieSchema = new mongoose.Schema({
  title: String,
  genre: String,
  releaseYear: Number,
  director: String,
  cast: [String],
});

// Define Movie model
const Movie = mongoose.model("Movie", movieSchema);

// API Endpoints

// Retrieve all movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movie.find();
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new movie
app.post("/movies", async (req, res) => {
  const { title, genre, releaseYear, director, cast } = req.body;

  try {
    const movie = new Movie({
      title,
      genre,
      releaseYear,
      director,
      cast,
    });

    const savedMovie = await movie.save();
    res.status(201).json(savedMovie);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve a specific movie by its ID
app.get("/movies/:id", async (req, res) => {
  const movieId = req.params.id;

  try {
    const movie = await Movie.findById(movieId);
    if (!movie) {
      res.status(404).json({ error: "Movie not found" });
    } else {
      res.json(movie);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a specific movie by its ID
app.put("/movies/:id", async (req, res) => {
  const movieId = req.params.id;
  const { title, genre, releaseYear, director, cast } = req.body;

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      { title, genre, releaseYear, director, cast },
      { new: true }
    );
    if (!updatedMovie) {
      res.status(404).json({ error: "Movie not found" });
    } else {
      res.json(updatedMovie);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a specific movie by its ID
app.delete("/movies/:id", async (req, res) => {
  const movieId = req.params.id;

  try {
    const removedMovie = await Movie.findByIdAndRemove(movieId);
    if (!removedMovie) {
      res.status(404).json({ error: "Movie not found" });
    } else {
      res.json({ message: "Movie deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});

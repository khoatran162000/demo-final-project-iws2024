// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const bodyParser = require("body-parser");

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Configure Multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Connect to MongoDB Atlas
mongoose
  .connect("<your-mongodb-atlas-connection-string>", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

// Define Recipe schema
const recipeSchema = new mongoose.Schema({
  title: String,
  ingredients: [String],
  instructions: String,
  cookingTime: Number,
  difficultyLevel: String,
  category: String,
  imageUrl: String,
});

// Define Recipe model
const Recipe = mongoose.model("Recipe", recipeSchema);

// API Endpoints

// Retrieve all recipes
app.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new recipe
app.post("/recipes", upload.single("image"), async (req, res) => {
  const {
    title,
    ingredients,
    instructions,
    cookingTime,
    difficultyLevel,
    category,
  } = req.body;

  try {
    const recipe = new Recipe({
      title,
      ingredients,
      instructions,
      cookingTime,
      difficultyLevel,
      category,
      imageUrl: req.file ? req.file.path : undefined,
    });

    const savedRecipe = await recipe.save();
    res.status(201).json(savedRecipe);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve a specific recipe by its ID
app.get("/recipes/:id", async (req, res) => {
  const recipeId = req.params.id;

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ error: "Recipe not found" });
    } else {
      res.json(recipe);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a specific recipe by its ID
app.put("/recipes/:id", upload.single("image"), async (req, res) => {
  const recipeId = req.params.id;
  const {
    title,
    ingredients,
    instructions,
    cookingTime,
    difficultyLevel,
    category,
  } = req.body;

  try {
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      recipeId,
      {
        title,
        ingredients,
        instructions,
        cookingTime,
        difficultyLevel,
        category,
        imageUrl: req.file ? req.file.path : undefined,
      },
      { new: true }
    );
    if (!updatedRecipe) {
      res.status(404).json({ error: "Recipe not found" });
    } else {
      res.json(updatedRecipe);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a specific recipe by its ID
app.delete("/recipes/:id", async (req, res) => {
  const recipeId = req.params.id;

  try {
    const removedRecipe = await Recipe.findByIdAndRemove(recipeId);
    if (!removedRecipe) {
      res.status(404).json({ error: "Recipe not found" });
    } else {
      res.json({ message: "Recipe deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve recipes by category
app.get("/recipes/category/:category", async (req, res) => {
  const category = req.params.category;

  try {
    const recipes = await Recipe.find({ category });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve recipes by ingredients or difficulty level
app.get("/recipes/filter", async (req, res) => {
  const { ingredients, difficultyLevel } = req.query;

  try {
    let query = {};

    if (ingredients) {
      query.ingredients = { $all: ingredients.split(",") };
    }

    if (difficultyLevel) {
      query.difficultyLevel = difficultyLevel;
    }

    const recipes = await Recipe.find(query);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

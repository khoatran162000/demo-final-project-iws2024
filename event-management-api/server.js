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

// Define Event schema
const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  date: Date,
  time: String,
  rsvps: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

// Define Event model
const Event = mongoose.model("Event", eventSchema);

// API Endpoints

// Retrieve all events
app.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new event
app.post("/events", async (req, res) => {
  const { title, description, location, date, time } = req.body;

  try {
    const event = new Event({
      title,
      description,
      location,
      date,
      time,
    });

    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve a specific event by its ID
app.get("/events/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.json(event);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a specific event by its ID
app.put("/events/:id", async (req, res) => {
  const eventId = req.params.id;
  const { title, description, location, date, time } = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      {
        title,
        description,
        location,
        date,
        time,
      },
      { new: true }
    );
    if (!updatedEvent) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.json(updatedEvent);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a specific event by its ID
app.delete("/events/:id", async (req, res) => {
  const eventId = req.params.id;

  try {
    const removedEvent = await Event.findByIdAndRemove(eventId);
    if (!removedEvent) {
      res.status(404).json({ error: "Event not found" });
    } else {
      res.json({ message: "Event deleted successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// RSVP to an event
app.post("/events/:id/rsvps", async (req, res) => {
  const eventId = req.params.id;
  const { userId } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      res.status(404).json({ error: "Event not found" });
    } else {
      event.rsvps.push(userId);
      const updatedEvent = await event.save();
      res.json(updatedEvent);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Search events by location
app.get("/events/search", async (req, res) => {
  const { location } = req.query;

  try {
    const events = await Event.find({ location });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve upcoming events
app.get("/events/upcoming", async (req, res) => {
  const currentDate = new Date();

  try {
    const events = await Event.find({ date: { $gte: currentDate } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Retrieve past events
app.get("/events/past", async (req, res) => {
  const currentDate = new Date();

  try {
    const events = await Event.find({ date: { $lt: currentDate } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

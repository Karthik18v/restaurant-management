const express = require("express");
const mongoose = require("mongoose");

// Create Express app
const app = express();

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://bittukarthik77:Qt0bTqb4RubDz71b@cluster0.2xebt.mongodb.net/",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Define MenuItem schema and model
const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

//Define Orders Schema and model

const orderSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  items: [
    {
      menuItems: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
      quantity: { type: Number, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

//Define reversation Schema

const reservationSchema = new mongoose.Schema({
  tableNumber: { type: Number, required: true },
  name: { type: String, required: true },
  date: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Pending", "Confirmed", "Cancelled"],
    default: "Pending",
  },
});

const Reservation = mongoose.model("Reservation", reservationSchema);

// Middleware to parse JSON request body
app.use(express.json());

// POST route to add new menu item using Model.create()
app.post("/menu", async (req, res) => {
  try {
    // Directly create and save the new menu item in one step
    const savedMenuItem = await MenuItem.create(req.body);

    // Return the created menu item as a response
    res.status(201).json(savedMenuItem);
  } catch (error) {
    // Handle errors (e.g., validation issues)
    res.status(400).json({ error: error.message });
  }
});

//Get Menu Items
app.get("/menu", async (request, response) => {
  try {
    const menuItems = await MenuItem.find();
    response.status(200).send(menuItems);
  } catch (error) {
    response.status(500).send("Failed to fetch menu items");
  }
});

//POST route to add new Order using Model.create()

app.post("/orders", async (request, response) => {
  try {
    console.log(request.body);
    const savedOrder = await Order.create(request.body);
    response.status(201).send(savedOrder);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

//GET route to get orders
app.get("/orders", async (request, response) => {
  try {
    const orders = await Order.find();
    response.status(200).send(orders);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

//Post Route to add new Reservation.

app.post("/reservations", async (request, response) => {
  try {
    const reservation = await Reservation.create(request.body);
    response.status(201).send(reservation);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

app.get("/reservations", async (request, response) => {
  try {
    const savedReservations = await Reservation.find();
    response.status(200).send(savedReservations);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

//get total sales report
app.get("/report/sales", async (request, response) => {
  const orders = await Order.find();
  const total = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  response.status(200).send({total:total})
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

const mongoose = require("mongoose");
const connectDB = () => {
  mongoose
  .connect('mongodb+srv://ajay123:ajay123@mobae-puvlf.mongodb.net/expensetracker?retryWrites=true&w=majority', {
  // .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("db connected"))
    .catch((err) => console.log(err));
};
module.exports = connectDB;

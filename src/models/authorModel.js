const mongoose = require("mongoose");
const validator = require("validator");

const authorSchema = new mongoose.Schema(
  {
    fname: {
      type: String,
      required: "fname is required",
      trim: true,
      validate(value) {
        if (!validator.isAlpha(value)) {
          throw new Error("fname is not valid");
        }
      },
    },
      
    lname: {
      type: String,
      required: "lname is required",
      trim: true,
      validate(value) {
        if (!validator.isAlpha(value)) {
          throw new Error("Lname is not valid");
        }
      },
    },
    title: {
      required: "title is required",
      type: String,
      enum: ["Mr", "Mrs", "Miss"],
      trim: true,
    },
    email: {
      type: String,
      require: "email is required",
      trim: true,
      lowercase: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("email is Invalid");
        }
      },
    },
    password: {
      type: String,
      required: "password is required",
      trim: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("password must contain : minLength:8 minLowercase:1 minUppercase:1 minNumbers:1 minSymbols:1");
        }
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NewAuthor", authorSchema);

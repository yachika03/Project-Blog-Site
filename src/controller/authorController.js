const authorModel=require("../models/authorModel.js")
const jwt = require("jsonwebtoken")
const validator = require("validator");


const isValid = function(value){
  if(typeof value === 'undefined' || value === null) return false
  if(typeof value == 'string' && value.trim().length === 0) return false
  return true
}

const isValidTitle = function(title){
  return ['Mr', 'Mrs', 'Miss'].indexOf(title) !== -1
}

const isVAlidRequestBody = function(requestBody){
  return Object.keys(requestBody).length > 0
}

// create author ---------------------------------------
const createAuthor= async function (req,res){
    try {
      let requestBody =req.body   
      if(!isVAlidRequestBody(requestBody)){
        return res.status(400).send({status: false, msg: "please input author Details"})
      }

      // Extract params
      const {fname, lname, title, email, password,} = requestBody // Object destructing

      //validation start
      if(!isValid(fname)){
        return res.status(400).send({status: false, msg: "first name is required"})
      }

      if(!isValid(lname)){
        return res.status(400).send({status: false, msg: "last name is required"})
      }

      if(!isValid(title)){
        return res.status(400).send({status: false, msg: "title is required"})
      }

      if(!isValidTitle(title)){
        return res.status(400).send({status: false, msg: "title shoud be among Mr, Mrs, and Miss"})

      }

      if(!isValid(email)){
        return res.status(400).send({status: false, msg: "Email is required"})
      }

      if (!validator.isEmail(email)){
        return res.status(400).send({status: false, msg: "Email should be a valid email address"})
      }

      if(!isValid(password)){
        return res.status(400).send({status: false, msg: "password is required"})
      }

      const isEmailAlreadyUsed = await authorModel.findOne({email})
      if(isEmailAlreadyUsed){
        return res.status(400).send({status: false, msg: "email already registered"})
      }
      // validation end

      const authorData = {fname, lname, title, email, password,}
      const newAuthor = await authorModel.create(authorData)

      res.status(201).send({status: true, msg: "author created successfully", data: newAuthor})
    }
    catch (error){
        res.status(500).send(error.message)
    }
}




// login ----------------------------------------------------------------------

const loginUser = async function(req,res){
  try {
    let requestBody = req.body
    if(!isVAlidRequestBody(requestBody)){
      return res.status(400).send({status: false, msg: "please provide login details"})
    }

    // Extract params
    const {email, password} = requestBody

    // validation check
    if(!isValid(email)){
      return res.status(400).send({status: false, msg: "email is required"})
    }

    if (!validator.isEmail(email)){
      return res.status(400).send({status: false, msg: "Email should be a valid email address"})
    }

    if(!isValid(password)){
      return res.status(400).send({status: false, msg: "password is required"})
    }
    // validation end

    const author = await authorModel.findOne({email, password})
    if(!author){
      return res.status(401).send({status: false, msg: "Invalid login credentials"})
    }

    const token = jwt.sign({authorId: author._id.toString()},"blog-site-project-01")
    return res.status(200).send({status:true, msg:token})

} catch (error) {
    res.status(500).send(error.message);
  }
}

// ------------------- EXPORTING MODULE TO ROUTE.JS -----------------------------------------------------
module.exports.createAuthor=createAuthor
module.exports.loginUser = loginUser

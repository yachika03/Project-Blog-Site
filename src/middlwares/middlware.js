const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const blogModel = require('../models/BlogModel');


//--------------------AUTHENTICATION------------------------------------

const authenticate = async function(req,res,next){
    try{
     const token = req.headers["x-api-key"];
     if(!token) { return res.status(400).send({msg:"please provide token"});}
     const decodedToken = jwt.verify(token, "blog-site-project-01");
     if(!decodedToken) return res.status(401).send({status:false, msg:"invalid token"});
 //adding a decodedToken as a property inside request object so that could be accessed in other handler and middleware of same api
     req.decodedToken = decodedToken;
     next();
    }catch(error){
        res.status(500).send({error: error.message})
    }
};

//------------------------AUTHORIZATION-----------------------------------

const authorise = async function (req,res,next){
    try{
        const blogId = req.params["blogId"];
        
        const decodedToken = req.decodedToken;
        const blogByBlogId = await blogModel.findOne({_id: blogId,isDeleted: false,deletedAt: null,});
        if(!blogByBlogId){ return res.status(404).send({status:false, message:`no blogs found by blogId`});}
        if(decodedToken.authorId != blogByBlogId.authorId){
            return res.status(403).send({status:false , message:"unauthorize access"});
        }
        next()
    }catch(error){
        res.status(500).send({error: error.message})
    }
}

// ------------------- EXPORTING MODULE TO ROUTE.JS -----------------------------------------------------

module.exports.authenticate = authenticate  // AUTHENTICATION OF USER
module.exports.authorise=authorise          // AUTHORIZATION OF USER

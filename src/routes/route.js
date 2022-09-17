const express = require('express');
const router = express.Router();

const authorController= require("../controller/authorController.js")
const blogController=require("../controller/blogController.js")
const midd = require("../middlwares/middlware.js")

// Create Authors
router.post("/authors",authorController.createAuthor)
// Create Blogs
router.post("/blogs",midd.authenticate,blogController.createBlog)
// Get blogs
router.get("/blogs",midd.authenticate,blogController.getAllBlog)
// Update Blogs by blog ID
router.put("/blogs/:blogId",midd.authenticate,midd.authorise,blogController.UpdateBlog)
// Delete Blogs by blog ID
router.delete("/blogs/:blogId",midd.authenticate,midd.authorise,blogController.deleteBlog)
// Delete Blogs by Query params
 router.delete("/blogs",midd.authenticate,midd.authorise,blogController.deleteBlogs)
// Author Login
router.post("/login",authorController.loginUser)


module.exports = router;

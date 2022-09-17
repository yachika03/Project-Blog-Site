const mongoose = require('mongoose');
const authorModel = require("../models/authorModel.js");
const blogModel = require("../models/BlogModel.js");
const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length > 0) return true;
  return false;
};

const isValidRequest = function (object) {
  return Object.keys(object).length > 0
};

const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId)
};

const isValidTagsAndSubcategory = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length > 0) return true;
  if (typeof value === "object" && Array.isArray(value) === true) return true;
  return false;
};

// create Blog |----------------------------------------------------------------
const createBlog = async function (req, res) {
  try {

    const requestBody = req.body;
    const queryParams = req.query;
    const decodedToken = req.decodedToken;

    //query params must not be empty
    if (isValidRequest(queryParams)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid request" });
    }

    //request body must not be empty
    if (!isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "Blog details are required" });
    }

    //using destructuring
    const { title, body, authorId, tags, category, subcategory, isPublished } = requestBody;

    //checking keys inside requestBody
    if (Object.keys(requestBody).length > 7) {
      return res
        .status(400)
        .send({ status: false, message: "invalid data entry inside request body" });
    }

    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Blogs title is required" });
    }

    if (!isValid(body)) {
      return res
        .status(400)
        .send({ status: false, message: "Blog body is required" });
    }

    if (!isValidObjectId(authorId)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid authorid" });
    }

    const authorByAuthorId = await authorModel.findById(authorId);

    if (!authorByAuthorId) {
      return res
        .status(400)
        .send({ status: false, message: `No author found by ${authorId}` });
    }

    //is author authorized to create this blog
    if (authorId != decodedToken.authorId) {
      return res
        .status(400)
        .send({ status: false, message: "Unauthorized access" });
    }

    //tags could be array of strings
    if (requestBody.hasOwnProperty("tags")) {
      if (!isValidTagsAndSubcategory(tags)) {
        return res
          .status(400)
          .send({ status: false, message: "Blogs tags must be in valid format" });
      }
    }

    if (!isValid(category)) {
      return res
        .status(400)
        .send({ status: false, message: "Blogs category is required" });
    }

    if (requestBody.hasOwnProperty("subcategory")) {
      if (!isValidTagsAndSubcategory(subcategory)) {
        return res
          .status(400)
          .send({ status: false, message: "Blog subcategory must be in valid format" });
      }
    }

    if (requestBody.hasOwnProperty("isPublished")) {
      if (typeof isPublished != "boolean") {
        return res
          .status(400)
          .send({ status: false, message: "isPublihed should be boolean" });
      }
    }

    const blogData = {
      title: title.trim(),
      body: body.trim(),
      authorId: authorId.trim(),
      tags: tags,
      category: category.trim(),
      subcategory: subcategory,
      isDeleted: false,
      deletedAt: null
    }

    //if blog is to be published after creation then publishedAt to be updated
    if (isPublished == true) {
      blogData.isPublished = isPublished
      blogData.publishedAt = Date.now()
    } else {
      blogData.isPublished = false;
      blogData.publishedAt = null;
    }

    const blog = await blogModel.create(blogData);

    res
      .status(201)
      .send({ status: true, message: "new Blog created successfully", data: blog });

  } catch (error) {

    return res
      .status(500)
      .send({ msg: error.message })

  }
};



// get Blogs |----------------------------------------------------------------
let getAllBlog = async function (req, res) {
  try {

    const requestBody = req.body;
    const queryParams = req.query;

    //conditions to find all not deleted blogs
    const filterCondition = {
      isDeleted: false,
      isPublished: true,
      deletedAt: null
    };

    if (isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "data is required in body" });
    }

    //if queryParams are present then each key to be validated then only to be added to filterCondition object. on that note filtered blogs to be returened
    if (isValidRequest(queryParams)) {
      const { authorId, category, tags, subcategory } = queryParams;

      if (queryParams.hasOwnProperty("authorId")) {
        if (!isValidObjectId(authorId)) {
          return res
            .status(400)
            .send({ status: false, message: "Enter a valid authorId" });
        }
        const authorByAuthorId = await authorModel.findById(authorId);

        if (!authorByAuthorId) {
          return res
            .status(400)
            .send({ status: false, message: "no author found" })
        }
        filterCondition["authorId"] = authorId;
      }

      if (queryParams.hasOwnProperty("category")) {
        if (!isValid(category)) {
          return res
            .status(400)
            .send({ status: false, message: "Blog category should be in valid format" });
        }
        filterCondition["category"] = category.trim();
      }

      //if tags and subcategory are an array then validating each element
      if (queryParams.hasOwnProperty("tags")) {
        if (Array.isArray(tags)) {
          for (let i = 0; i < tags.length; i++) {
            if (!isValid(tags[i])) {
              return res
                .status(400)
                .send({ status: false, message: "blog tag must be in valid format" });
            }
            filterCondition["tags"] = tags[i].trim();
          }
        } else {
          if (!isValid(tags)) {
            return res
              .status(400)
              .send({ status: false, message: "Blog tags must in valid format" });
          }
          filterCondition["tags"] = tags.trim();
        }
      }

      if (queryParams.hasOwnProperty("subcategory")) {
        if (Array.isArray(subcategory)) {
          for (let i = 0; i < subcategory.length; i++) {
            if (!isValid(subcategory[i])) {
              return res
                .status(400)
                .send({ status: false, message: "blog subcategory must be in valid format" });
            }
            filterCondition["subcategory"] = subcategory[i].trim();
          }
        } else {
          if (!isValid(subcategory)) {
            return res
              .status(400)
              .send({ status: false, message: "Blog subcategory must in valid format" });
          }
          filterCondition["subcategory"] = subcategory.trim();
        }
      }

      const filetredBlogs = await blogModel.find(filterCondition)

      if (filetredBlogs.length == 0) {
        return res
          .status(404)
          .send({ status: false, message: "no blogs found" });
      }

      res
        .status(200)
        .send({ status: true, message: "filtered blog list", blogsCounts: filetredBlogs.length, blogList: filetredBlogs })

      //if no queryParams are provided then finding all not deleted blogs
    } else {
      const allBlogs = await blogModel.find(filterCondition);

      if (allBlogs.length == 0) {
        return res
          .status(404)
          .send({ status: false, message: "no blogs found" })
      }
      res
        .status(200)
        .send({ status: true, message: "blogs list", blogsCount: allBlogs.length, blogsList: allBlogs });
    }

  } catch (error) {

    res.status(500).send({ error: error.message })

  }
};


// put Blogs |----------------------------------------------------------------

let UpdateBlog = async function (req, res) {
  try {

    const blogId = req.params["blogId"]
    const requestBody = req.body;
    const queryParams = req.query;

    if (isValidRequest(queryParams)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid request" })
    }

    if (!isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "blog details are required for update" })
    }

    if (!isValidObjectId(blogId)) {
      return res
        .status(400)
        .send({ status: false, message: "Enter a valid blogId" })
    }

    const blogByBlogID = await blogModel.findOne({
      _id: blogId,
      isDeleted: false,
      deletedAt: null
    });

    if (!blogByBlogID) {
      return res
        .status(400)
        .send({ status: false, message: `no blog found by ${blogId}` });
    }

    //using destructuring then validating selected keys by user
    const { title, body, tags, subcategory } = requestBody;

    //update object has been created with two properties. if updating key is to be replaced && type is string then will be added to $set and if it is to be added && type is an array then will be added to $addToSet

    const update = {
      $set: { isPublished: true, publishedAt: Date.now() },
      $addToSet: {}
    };

    if (requestBody.hasOwnProperty("title")) {
      if (!isValid(title)) {
        return res
          .status(400)
          .send({ status: false, message: "blog title should be in valid format" });
      }
      update.$set["title"] = title.trim();
    }

    if (requestBody.hasOwnProperty("body")) {
      if (!isValid(body)) {
        return res
          .status(400)
          .send({ status: false, message: "blog body should be in valid format" });
      }
      update.$set["body"] = body.trim();
    }

    if (requestBody.hasOwnProperty("tags")) {
      if (Array.isArray(tags)) {
        for (let i = 0; i < tags.length; i++) {
          if (!isValid(tags[i])) {
            return res
              .status(400)
              .send({ status: false, message: "Blog tags must be in valid format" });
          }
        }
        update.$addToSet["tags"] = { $each: tags };
      } else {
        if (!isValid(tags)) {
          return res
            .status(400)
            .send({ status: false, message: "blog tags must be in valid format" })
        }
        update.$addToSet["tags"] = tags.trim();
      }
    }

    if (requestBody.hasOwnProperty("subcategory")) {
      if (Array.isArray(subcategory)) {
        for (let i = 0; i < subcategory.length; i++) {
          if (!isValid(subcategory[i])) {
            return res
              .status(400)
              .send({ status: false, message: "Blog subcategory must be in valid format" });
          }
        }
        update.$addToSet["subcategory"] = { $each: subcategory };
      } else {
        if (!isValid(subcategory)) {
          return res
            .status(400)
            .send({ status: false, message: "blog subcategory must be in valid format" })
        }
        update.$addToSet["subcategory"] = subcategory.trim();
      }
    }

    const updatedBlog = await blogModel.findOneAndUpdate(
      { _id: blogId, isDeleted: false, deletedAt: null },
      update,
      { new: true }
    )

    res
      .status(200)
      .send({ status: true, message: "blog updated successfully", data: updatedBlog });

  } catch (error) {

    res.status(500).send({ error: error.message })

  }
};

// DELETE /blogs/:blogId ----------------------------------------------------------

let deleteBlog = async function (req, res) {
  try {

    const requestBody = req.body;
    const queryParams = req.query;
    const blogId = req.params.blogId;

    if (isValidRequest(queryParams)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid Request" });
    }

    if (isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "invalid Request" });
    }

    if (!isValidObjectId(blogId)) {
      return res
        .status(400)
        .send({ status: false, message: `${id} is not a valid blogID` });
    }

    const blogByBlogId = await blogModel.findOne({
      _id: blogId,
      isDeleted: false,
      deletedAt: null
    })

    if (!blogByBlogId) {
      return res
        .status(404)
        .send({ status: false, message: `no blog found by ${blogId}` })
    }

    await blogModel.findByIdAndUpdate(
      { _id: blogId },
      { $set: { isDeleted: true, deletedAt: Date.now() } },
      { new: true }
    );

    res
      .status(200)
      .send({ status: true, message: "blog sucessfully deleted" });

  } catch (error) {

    res.status(500).status({ status: false, message: error.message })

  }
};

// DELETE /blogs?queryParams --------------------------------------------------

let deleteBlogs = async function (req, res) {
  try {

    const requestBody = req.body;
    const queryParams = req.query;
    let result = [];

    if (isValidRequest(requestBody)) {
      return res
        .status(400)
        .send({ status: false, message: "data is not required insdie request body" });
    }

    const filterCondition = {
      isDeleted: false,
      deletedAt: null,
      isPublished: false,
      publishedAt: null
    };

    if (isValidRequest(queryParams)) {
      const { title, authorId, subcategory, tags } = queryParams;

      if (Object.keys(queryParams).length > 4) {
        return res
          .status(400)
          .send({ status: false, message: "invalid entry inside query params" });
      }

      if (queryParams.hasOwnProperty("title")) {
        if (!isValid(title)) {
          return res
            .status(400)
            .send({ message: "blogs title should be in valid format" });
        }
        filterCondition["title"] = title.trim();
      }

      if (queryParams.hasOwnProperty("authorId")) {
        if (!isValid(authorId)) {
          return res
            .status(400)
            .send({ message: "blogs authorId should be in valid format" });
        }

        if (!isValidObjectId(authorId)) {
          return res
            .status(400)
            .send({ status: false, message: "blog authorId is invalid" })
        }
        const authorByAuthorId = await authorModel.findById(authorId);

        if (!authorByAuthorId) {
          return res
            .status(404)
            .send({ status: false, message: `no author found by ${authorId}` })
        }
        filterCondition["authorId"] = authorId;
      }

      if (queryParams.hasOwnProperty("subcategory")) {
        if (!isValid(subcategory)) {
          return res
            .status(400)
            .send({ message: "blogs subcategory should be in valid format" });
        }
        filterCondition["subcategory"] = subcategory.trim();
      }

      if (queryParams.hasOwnProperty("tags")) {
        if (!isValid(tags)) {
          return res
            .status(400)
            .send({ message: "blogs tags should be in valid format" });
        }
        filterCondition["tags"] = tags.trim();
      }

      const filteredBlogs = await blogModel.find(filterCondition)
      
      if (Array.isArray(filteredBlogs) && filteredBlogs.length > 0) {
        
        for (let i = 0; i < filteredBlogs.length; i++) {
          if (!(filteredBlogs[i].authorId == req.decodedToken.authorId))
            continue;
          result.push(filteredBlogs[i]._id);
        }
        if (result.length == 0)
          return res.status(403).send({ msg: "You are not Authorized" })

        await blogModel.updateMany(
          { _id: { $in: result } },
          { $set: { isDeleted: true, deletedAt: Date.now() } }
        );

        res
          .status(200)
          .send({ status: true, message: "blog deleted sucessfully" })
      } else {
        return res
          .status(404)
          .send({ status: false, message: "no blog found" })
      }

    } else {

      return res
        .status(400)
        .send({ status: false, message: "data is required for deleting blogs" });

    }

  } catch (error) {

    res.status(500).send({ error: error.message });

  }

}


// ------------------- EXPORTING MODULE TO ROUTE.JS -----------------------------------------------------

module.exports.createBlog = createBlog;   // CREATE BLOG
module.exports.getAllBlog = getAllBlog;   // GET BLOGS
module.exports.UpdateBlog = UpdateBlog;   // UPDATE BLOGS
module.exports.deleteBlog = deleteBlog;   // DELETE BLOG BY PARAMS
module.exports.deleteBlogs = deleteBlogs; // DELETE BLOG BY QUERY PARAMS

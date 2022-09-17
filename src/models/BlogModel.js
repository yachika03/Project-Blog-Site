const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required:"title is required",
        trim: true
    },
    body: {
        type: String,
        required: "body is required",
        trim: true
    },
    authorId: {
        type: ObjectId,
        ref: "NewAuthor",
        required: "author is required",
        trim:true
    },

    tags: [String],
    category: {
        type: String,
        required:"category is required",
        trim: true
    },
    subcategory: {
        type: [String],
        required: "category is required",
        trim: true
    },

    deletedAt: {
        type: Date,
        default: null,
        trim: true
    },

    isDeleted: {
        type: Boolean,
        default: false,
        trim: true
    },
    publishedAt: {
        type: Date,
        default: null,
        trim: true
    },
    isPublished: {
        type: Boolean,
         default: false,
        trim: true
    },


}, { timestamps: true });


module.exports = mongoose.model('BookCollection', bookSchema)

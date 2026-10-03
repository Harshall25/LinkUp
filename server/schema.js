const mongoose = require('mongoose');
const { toMediaUrl } = require('./utils/media');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name : String,
    email : {type : String , unique : true},
    password : String,
    googleId : {type : String, unique : true, sparse : true},
    avatar : String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userModel' }], // Users following this user
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userModel' }], // Users this user is following
    createdAt : {type: Date  , default : Date.now}
});

const userModel = mongoose.model('userModel', userSchema);

const postSchema = new Schema({
    title : String,
    content : String,
    author : {
        type:mongoose.Schema.Types.ObjectId,
        ref : "userModel",
        required: true
    },
    tags : {
        type : [String],
        default : [],
    },
    imageUrl : {type : String, set : toMediaUrl, get : toMediaUrl},
    likesCount : {type : Number, default : 0},
    createdAt : {type: Date, default : Date.now},
    updatedAt : {type: Date, default : Date.now}
}, { id: false, toJSON: { getters: true } });

postSchema.index({ createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

const postModel = mongoose.model('postModel',postSchema);

const commentSchema = new Schema({
    content : String,
    post : {
        type : mongoose.Schema.Types.ObjectId,
        ref:'postModel',
        required: true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'userModel',
        required: true
    },
    createdAt : {type: Date  , default : Date.now}
})

commentSchema.index({ post: 1, createdAt: -1 });

const commentModel = mongoose.model('commentModel', commentSchema);

const likeSchema = new Schema ({
    post : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'postModel',
        required: true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'userModel',
        required: true
    },
    createdAt : {type: Date  , default : Date.now}
})

// Create a compound index to ensure a user can like a post only once
likeSchema.index({ post: 1, user: 1 }, { unique: true });

const likeModel = mongoose.model('likeModel',likeSchema);

module.exports = {
    userModel,
    postModel,
    commentModel,
    likeModel
}

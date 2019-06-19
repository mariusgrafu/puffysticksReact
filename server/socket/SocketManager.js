const mongoose = require('mongoose');

const User = require('../models/User');
const Group = require('../models/Group');
const SiteSettings = require('../models/SiteSettings');
const Permission = require('../models/Permission');
const NavLink = require('../models/NavLink');
const SocialLink = require('../models/SocialLink');
const WhatsGood = require('../models/WhatsGood');

const BlogPost = require('../models/BlogPost');
const PortfolioPost = require('../models/PortfolioPost');
const GoodiesPost = require('../models/GoodiesPost');

const Changelog = require('../models/Changelog');

const TabPage = require('../models/TabPage');
const PageFollower = require('../models/PageFollower');
const UserNotifications= require('../models/UserNotifications');
const Like = require('../models/Like');
const Comment = require('../models/Comment');

const ContactMessage = require('../models/ContactMessage');
const ContactReply = require('../models/ContactReply');

const BugReport = require('../models/BugReport');

const Terms = require('../models/Terms');

const path = require('path');
const fs = require('fs');

function checkEmail(email){
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const isEmpty = (val) => {
    return (val === '' || val === null || val === undefined);
}

let addPageNotification;
let notifyStaff;
let notifyGroups;
let notifyUsers;


module.exports = (socket, io) => {
    console.log(`Socket id: ${socket.id}`);

    addPageNotification = (pageK, {type, content, postDate}) => {
        let nowDate = Date.now();
        PageFollower.find({pageKey : pageK})
        .exec( (err, followers) => {
            if(err) throw err;
            if(!followers.length) return;
    
            followers.map( (follower) => {
                let newUserNot = new UserNotifications;
                newUserNot.type = type;
                newUserNot.user = follower.user;
                newUserNot.content = content;
                newUserNot.content.pageKey = pageK;
                newUserNot.postDate = postDate || nowDate;
    
                newUserNot.save( (err, notification) => {
                    if(err) throw err;
                    io.emit(`server > client refresh userNotificationCount ${notification.user}`);
                    io.emit(`server > client refresh userNotification ${notification.user}`);
                })
            });
        })
    }

    notifyGroups = (groups, pageK, {type, content, postDate}) => {
        let nowDate = Date.now();
        if(!groups.length) return;
        let orArr = [];
        groups.map( (gr) => {
            orArr.push(
                {
                    group : gr._id
                }
            );
        });
        User.find({$or: orArr})
        .exec( (err, users) => {
            if(err) throw err;
            if(!users.length) return;
            users.map( (usr) => {
                let newUserNot = new UserNotifications;
                newUserNot.type = type;
                newUserNot.user = usr._id;
                newUserNot.content = content;
                newUserNot.content.pageKey = pageK;
                newUserNot.postDate = postDate || nowDate;
    
                newUserNot.save( (err, notification) => {
                    if(err) throw err;
                    io.emit(`server > client refresh userNotificationCount ${notification.user}`);
                    io.emit(`server > client refresh userNotification ${notification.user}`);
                })
            });
        });
    }

    notifyUsers = (users, pageK, {type, content, postDate}) => {
        let nowDate = Date.now();
        let orArr = [];
        if(!users.length) return;
        users.map( (usr) => {
            orArr.push(
                {
                    _id : usr._id
                }
            );
        });
        User.find({$or: orArr})
        .exec( (err, users) => {
            if(err) throw err;
            if(!users.length) return;
            users.map( (usr) => {
                let newUserNot = new UserNotifications;
                newUserNot.type = type;
                newUserNot.user = usr._id;
                newUserNot.content = content;
                newUserNot.content.pageKey = pageK;
                newUserNot.postDate = postDate || nowDate;
    
                newUserNot.save( (err, notification) => {
                    if(err) throw err;
                    io.emit(`server > client refresh userNotificationCount ${notification.user}`);
                    io.emit(`server > client refresh userNotification ${notification.user}`);
                })
            });
        });
    }

    notifyStaff = (pageK, {type, content, postDate}) => {
        Group.find({isStaff : true})
        .select('_id')
        .exec( (err, staffGroups) => {
            if(err) throw err;
            if(!staffGroups.length) return;
            
            notifyGroups(staffGroups, pageK, {type, content, postDate});
        })
    }

    // send navLinks to client
    socket.on('client > server get navLinks', (cb) => {
        NavLink.find({}, (err, navlinks) => {
            if(err) {
                cb(null);
                throw err;
            }
            cb(navlinks);
        });
    });

    socket.on('client > server get socialLinks', (cb) => {

        SocialLink.find({}, (err, socialLinks) => {
            if(err) throw err;

            cb(socialLinks);
        });

    });

    socket.on("client > server get colors", (cb) => {
        SiteSettings.findOne({}, 'colors', (err, ss) => {
            if(err) throw err;
            let ret = {};
            for(let i in ss.colors){
                ret[ss.colors[i].key] = ss.colors[i].value;
            }
            cb(ret);
        });
    });

    socket.on(`client > server get siteSettings`, (cb) => {
        SiteSettings.find({}, (err, ss) => {
            if(err) {
                cb(null);
                throw err;
            }
            cb(ss[0]);
        });
    });

    socket.on('client > server getUser', (data, cb) => {
        if(!mongoose.Types.ObjectId.isValid(data.userId)) {
            cb(1);
            return;
        }
        User.findOne({_id : data.userId, userKey : data.userKey})
        .populate('group')
        .select('-password')
        .exec((err, user) => {
            if(err){
                cb(err);
                throw err;
            }
            if(!user) {
                cb(1);
                return;
            }
            cb(0, user);
        });
    });

    socket.on('client > server get WhatsGood items', (cb) => {
        WhatsGood.find({}, (err, wg) => {
            if(err) throw err;
            if(!wg.length) return;
            cb(wg);
        });
    });

    socket.on('client > server whatsGood getPost', (postKey, cb) => {
        let dateNow = Date.now();
        switch(postKey){
            case 'blog':
            BlogPost.findOne({featured : true, visible : true, postDate : {$lte : dateNow} })
            .select("title cover thumbnail")
            .sort({postDate : -1})
            .exec( (err, post) => {
                if(err) throw err;
                if(post) cb(post);
            });
            break;
            case 'portfolio':
            PortfolioPost.findOne({featured : true, visible : true, postDate : {$lte : dateNow} })
            .select("title images thumbnail")
            .sort({postDate : -1})
            .exec( (err, post) => {
                if(err) throw err;
                if(post) cb(post);
            });
            break;
            case 'goodies':
            GoodiesPost.findOne({featured : true, visible : true, postDate : {$lte : dateNow} })
            .select("title cover thumbnail")
            .sort({postDate : -1})
            .exec( (err, post) => {
                if(err) throw err;
                if(post) cb(post);
            });
            break;
        }
    });

    socket.on('client > server loginAccount', (data, cb) => {

        User.findOne({username : new RegExp(data.username, "i")}, (err, user) => {
            if(err){
                cb(2, `there was a problem with the server! try again later!`);
                console.log(err);
                return;
            }
            if(!user){
                cb(2, `no account found matching the username and password you entered!`);
                return;
            }
            if(user.validPassword(data.password)){
                cb(0, {userId: user._id, userKey: user.userKey});
            }else{
                cb(2, `no account found matching the username and password you entered!`);
            }
        });

    });

    socket.on('client > server registerAccount', (data, cb) => {
        
        let canDo = 1;
        let errors = {};
        
        if(!data.policyTerms){
            canDo = 0;
            errors.checkbox = `you must agree to our policy privacy and terms of use!`;
        }

        if(data.displayName.length < 3 || data.displayName.length > 20){
            canDo = 0;
            errors.displayName = `display name should be between 3 and 20 characters long!`;
        }

        if(data.username.length < 3 || data.username.length > 20){
            canDo = 0;
            errors.username = `username should be between 3 and 20 characters long!`;
        }

        if(!checkEmail(data.email)){
            canDo = 0;
            errors.email = `this must be a valid email address!`;
        }

        if(data.password.length < 6){
            canDo = 0;
            errors.password = `password must be at least 6 characters long!`;
        }

        if(data.password != data.repassword){
            canDo = 0;
            errors.repassword = `passwords don't match!`;
        }

        if(!canDo){
            cb(1, errors);
        }else{
            const svProbMsg = `there was a problem with the server! try again later!`;

            User.find({$or : [{displayName : new RegExp(data.displayName, "i")}, {username : new RegExp(data.username, "i")}, {email : data.email}]},
                (err, users) => {
                    if(err) {
                        cb(2, svProbMsg);
                        console.log(err);
                        return;
                    }
                    canDo = 1;
                    let fields = [{k : 'displayName', v : 'display name'}, {k : 'username', v : 'username'}, {k : 'email', v : 'email'}];
                    for(let i in users){
                        for(let j in fields){
                            if(users[i][fields[j].k] == data[fields[j].k]) {
                                canDo = 0;
                                errors[fields[j].k] = `this ${fields[j].v} is already registered to another account!`;
                            }
                        }
                    }

                    if(!canDo){
                        cb(1, errors);
                    }else{
                        Promise.all([
                            Group.findOne({ isDefault: true }),
                            SiteSettings.findOne({})
                          ]).then( ([ group, siteSettings ]) => {
                              
                            let newUser = new User();

                            fields = ['displayName', 'username', 'email'];
                            for(let i in fields){
                                newUser[fields[i]] = data[fields[i]];
                            }

                            newUser.password = newUser.generateHash(data.password);
                            newUser.userKey = newUser.generateHash(Math.floor(Date.now()/1000).toString());
                            newUser.avatar = siteSettings.defaultAvatars[getRandomInt(0, siteSettings.defaultAvatars.length - 1)];
                            newUser.cover = siteSettings.defaultCovers[getRandomInt(0, siteSettings.defaultCovers.length - 1)];
                            newUser.group = group._id;

                            newUser.save((err, user) => {
                                if(err){
                                    cb(2, svProbMsg);
                                    console.log(err);
                                    return;
                                }

                                cb(0, {userId : user._id, userKey : user.userKey});
                            });
                          });


                    }
                }
            );

        }
    });

    socket.on('client > server get featuredItems', (pgKey, cb) => {
        switch(pgKey){
            case 'blog':
            BlogPost
            .find({featured : true, visible : true, postDate : {$lte : Date.now()} })
            .populate('author', '-password')
            .select("cover thumbnail title content postDate author views likes")
            .sort({postDate : -1})
            .limit(5)
            .exec((err, posts) => {
                if(err) throw err;
                cb(posts);
            });
            break;

            case 'portfolio':
            PortfolioPost
            .find({featured : true, visible : true, postDate : {$lte : Date.now()}})
            .select("title thumbnail postDate views likes images")
            .sort({postDate : -1})
            .limit(5)
            .exec( (err, posts) => {
                if(err) throw err;
                cb(posts);
            });
            break;

            case 'goodies':
            GoodiesPost
            .find({featured : true, visible : true, postDate : {$lte : Date.now()}})
            .select("title thumbnail postDate views likes cover")
            .sort({postDate : -1})
            .limit(5)
            .exec( (err, posts) => {
                if(err) throw err;
                cb(posts);
            });
            break;
        }
    });

    socket.on('client > server get tabPage', (pgKey, cb) => {
        TabPage.findOne({pageKey : pgKey}, (err, page) => {
            if(err) throw err;
            cb(page);
        });
    });

    socket.on('client > server get pageIsFollower', (userData, pageKey, cb) => {
        PageFollower.countDocuments({pageKey : pageKey, user : userData.userId},
        (err, isFollower) => {
            if(err) throw err;
            cb(isFollower);
        });
    });

    socket.on('client > server followPage', (userData, pgId, pgKey, cb) => {
        
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(pgId)) {
            return;
        }
        Promise.all([
            User.findOne({_id : userData.userId, userKey : userData.userKey})
            .select('group')
            .populate('group'),
            PageFollower.countDocuments({pageKey: pgKey, user: userData.userId})
        ]).then(([user, isFollower]) => {
            if(isFollower) return;
            if(user.group.permissions.can_followPages){
                const newFollow = new PageFollower();
                newFollow.pageKey = pgKey;
                newFollow.user = userData.userId;
                newFollow.save((err, follow) => {
                    if(err) throw err;
                    TabPage.findOneAndUpdate({_id : pgId}, {$inc: {followers: 1}}, {new: true }, (err, pg) => {
                        io.emit(`server > client ${pgKey} page update followers`, pg.followers);
                        cb(1);
                    });
                    
                });
            }
        });
    });

    socket.on('client > server unfollowPage', (userData, pgId, pgKey, cb) => {
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(pgId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .select('group')
        .populate('group')
        .exec( (err, user) => {
            if(err) throw err;
            if(!user) return;
            if(user.group.permissions.can_unfollowPages){
                PageFollower.findOneAndDelete({pageKey: pgKey, user: userData.userId}, (err) => {
                    if(err) throw err;
                    TabPage.findOneAndUpdate({_id : pgId, followers : {$gt : 0}}, {$inc: {followers: -1}}, {new: true }, (err, pg) => {
                        io.emit(`server > client ${pgKey} page update followers`, pg.followers);
                        cb(1);
                    });
                });
            }
        });
    });

    socket.on('client > server isLiked', (userData, postId, pgId, cb) => {
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(pgId) || !mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        Like.countDocuments({post : postId, user : userData.userId, pageId : pgId})
        .exec((err, cnt) => {
            if(err) throw err;
            cb(cnt);
        });
    });

    socket.on('client > server likePost', (userData, postId, pgId, pgKey) => {
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(pgId)){
            return;
        }
        Promise.all([
            User.findOne({_id : userData.userId, userKey : userData.userKey})
            .select('group')
            .populate('group'),
            Like.countDocuments({post: postId, user: userData.userId, pageId: pgId})
        ]).then(([user, isLiked]) => {
            if(isLiked) return;
            if(user.group.permissions.can_likePosts){
                const newLike = new Like();
                newLike.post = postId;
                newLike.user = userData.userId;
                newLike.pageId = pgId;
                newLike.save((err, like) => {
                    if(err) throw err;
                    switch(pgKey){
                        case 'blog':
                        BlogPost.findOneAndUpdate(
                            {_id : postId}, {$inc: {likes : 1}}, {new : true},
                            (err, post) => {
                                io.emit(`server > client updateLike ${pgId} ${postId}`, post.likes);
                            }
                        )
                        break;
                        case 'portfolio':
                        PortfolioPost.findOneAndUpdate(
                            {_id : postId}, {$inc: {likes : 1}}, {new : true},
                            (err, post) => {
                                io.emit(`server > client updateLike ${pgId} ${postId}`, post.likes);
                            }
                        )
                        break;
                        case 'goodies':
                        GoodiesPost.findOneAndUpdate(
                            {_id : postId}, {$inc: {likes : 1}}, {new : true},
                            (err, post) => {
                                io.emit(`server > client updateLike ${pgId} ${postId}`, post.likes);
                            }
                        )
                        break;
                    }
                });
            }
        });
    });

    socket.on('client > server unlikePost', (userData, postId, pgId, pgKey) => {
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(pgId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .select('group')
        .populate('group')
        .exec( (err, user) => {
            if(err) throw err;
            if(!user) return;
            if(user.group.permissions.can_unlikePosts){
                Like.findOneAndDelete({post: postId, user: userData.userId, pageId: pgId}, (err) => {
                    if(err) throw err;
                    
                    switch(pgKey){
                        case 'blog':
                        BlogPost.findOneAndUpdate(
                            {_id : postId, likes : {$gt : 0}}, {$inc: {likes : -1}}, {new : true},
                            (err, post) => {
                                if(err) throw err;
                                if(!post) return;
                                io.emit(`server > client updateLike ${pgId} ${postId}`, post.likes);
                            }
                        )
                        break;
                        case 'portfolio':
                        PortfolioPost.findOneAndUpdate(
                            {_id : postId, likes : {$gt : 0}}, {$inc: {likes : -1}}, {new : true},
                            (err, post) => {
                                if(err) throw err;
                                if(!post) return;
                                io.emit(`server > client updateLike ${pgId} ${postId}`, post.likes);
                            }
                        )
                        break;
                        case 'goodies':
                        GoodiesPost.findOneAndUpdate(
                            {_id : postId, likes : {$gt : 0}}, {$inc: {likes : -1}}, {new : true},
                            (err, post) => {
                                if(err) throw err;
                                if(!post) return;
                                io.emit(`server > client updateLike ${pgId} ${postId}`, post.likes);
                            }
                        )
                        break;
                    }
                });
            }
        });
    });

    socket.on(`client > server get blogPosts pageCount`, (data, cb) => {
        let {catKey, search, filter, onlyVisible} = data;
        let filters = {};
        if(onlyVisible) {
            filters.visible = true;
            filters.postDate = {$lte : Date.now()};
        }
        let orderOption = {
            postDate : -1
        }
        if(!isEmpty(search)){
            filters['$or'] = [
                {title : new RegExp(search, "i")},
                {tags : new RegExp(search, "i")}
            ];
        }
        if(!isEmpty(catKey)){
            filters.catType = catKey;
        }
        for(let i in filter){
            switch(filter[i].key){
                case 'order':
                if(filter[i].state == 'asc')
                    orderOption.postDate = 1;
                break;
                case 'featuredOnly':
                filters.featured = true;
                break;
            }
        }

        BlogPost.countDocuments({...filters}, (err, count) => {
            if(err) throw err;
            cb(count);
        });
    });

    socket.on(`client > server get portfolioPosts pageCount`, (data, cb) => {
        let {catKey, search, filter, onlyVisible} = data;

        let filters = {};
        if(onlyVisible) {
            filters.visible = true;
            filters.postDate = {$lte : Date.now()};
        }
        let orderOption = {
            postDate : -1
        }
        if(!isEmpty(search)){
            filters['$or'] = [
                {title : new RegExp(search, "i")},
                {tags : new RegExp(search, "i")}
            ];
        }
        if(!isEmpty(catKey)){
            filters.catType = catKey;
        }
        for(let i in filter){
            switch(filter[i].key){
                case 'order':
                if(filter[i].state == 'asc')
                    orderOption.postDate = 1;
                break;
                case 'featuredOnly':
                filters.featured = true;
                break;
            }
        }

        PortfolioPost.countDocuments({...filters}, (err, count) => {
            if(err) throw err;
            cb(count);
        });
    });

    socket.on(`client > server get goodiesPosts pageCount`, (data, cb) => {
        let {catKey, search, filter, onlyVisible} = data;

        let filters = {};
        if(onlyVisible) {
            filters.visible = true;
            filters.postDate = {$lte : Date.now()};
        }
        let orderOption = {
            postDate : -1
        }
        if(!isEmpty(search)){
            filters['$or'] = [
                {title : new RegExp(search, "i")},
                {tags : new RegExp(search, "i")}
            ];
        }
        if(!isEmpty(catKey)){
            filters.catType = catKey;
        }
        for(let i in filter){
            switch(filter[i].key){
                case 'order':
                if(filter[i].state == 'asc')
                    orderOption.postDate = 1;
                break;
                case 'featuredOnly':
                filters.featured = true;
                break;
            }
        }

        GoodiesPost.countDocuments({...filters}, (err, count) => {
            if(err) throw err;
            cb(count);
        });
    });

    socket.on(`client > server get blogPosts`, (data, cb) => {
        let {catKey, search, filter, onlyVisible, currentPage} = data;
        let filters = {};
        if(onlyVisible) {
            filters.visible = true;
            filters.postDate = {$lte : Date.now()};
        }
        let orderOption = {
            postDate : -1
        }
        const pageLimit = 24;
        const skipCount = (currentPage - 1) * pageLimit;
        if(!isEmpty(search)){
            filters['$or'] = [
                {title : new RegExp(search, "i")},
                {tags : new RegExp(search, "i")}
            ];
        }
        if(!isEmpty(catKey)){
            filters.catType = catKey;
        }
        for(let i in filter){
            switch(filter[i].key){
                case 'order':
                if(filter[i].state == 'asc')
                    orderOption.postDate = 1;
                break;
                case 'featuredOnly':
                if(filter[i].state)
                filters.featured = true;
                break;
            }
        }

        BlogPost.find({...filters})
        .sort({...orderOption})
        .populate('author', '-password')
        .limit(pageLimit)
        .skip(skipCount)
        .exec( (err, posts) => {
            if(err) throw err;
            cb(posts);
        });
    });

    socket.on(`client > server get portfolioPosts`, (data, cb) => {
        let {catKey, search, filter, onlyVisible, currentPage} = data;
        let filters = {};
        if(onlyVisible) {
            filters.visible = true;
            filters.postDate = {$lte : Date.now()};
        }
        let orderOption = {
            postDate : -1
        }
        const pageLimit = 24;
        const skipCount = (currentPage - 1) * pageLimit;
        if(!isEmpty(search)){
            filters['$or'] = [
                {title : new RegExp(search, "i")},
                {tags : new RegExp(search, "i")}
            ];
        }
        if(!isEmpty(catKey)){
            filters.catType = catKey;
        }
        for(let i in filter){
            switch(filter[i].key){
                case 'order':
                if(filter[i].state == 'asc')
                    orderOption.postDate = 1;
                break;
                case 'featuredOnly':
                if(filter[i].state)
                filters.featured = true;
                break;
            }
        }

        PortfolioPost.find({...filters})
        .sort({...orderOption})
        .limit(pageLimit)
        .skip(skipCount)
        .exec( (err, posts) => {
            if(err) throw err;
            cb(posts);
        });
    });

    socket.on(`client > server get goodiesPosts`, (data, cb) => {
        let {catKey, search, filter, onlyVisible, currentPage} = data;
        let filters = {};
        if(onlyVisible) {
            filters.visible = true;
            filters.postDate = {$lte : Date.now()};
        }
        let orderOption = {
            postDate : -1
        }
        const pageLimit = 24;
        const skipCount = (currentPage - 1) * pageLimit;
        if(!isEmpty(search)){
            filters['$or'] = [
                {title : new RegExp(search, "i")},
                {tags : new RegExp(search, "i")}
            ];
        }
        if(!isEmpty(catKey)){
            filters.catType = catKey;
        }
        for(let i in filter){
            switch(filter[i].key){
                case 'order':
                if(filter[i].state == 'asc')
                    orderOption.postDate = 1;
                break;
                case 'featuredOnly':
                if(filter[i].state)
                filters.featured = true;
                break;
            }
        }

        GoodiesPost.find({...filters})
        .sort({...orderOption})
        .limit(pageLimit)
        .skip(skipCount)
        .exec( (err, posts) => {
            if(err) throw err;
            cb(posts);
        });
    });

    socket.on(`client > server get blogPost`, (data, cb) => {
        const {postId, userData} = data;
        if(!mongoose.Types.ObjectId.isValid(postId)){
            cb(null);
            return;
        }
        BlogPost.findOne({_id : postId})
        .populate('author', '-password')
        .exec( (err, post) => {
            if(err){
                cb(null);
                return;
            }
            if(!post) {
                cb(null);
                return;
            }
            if(post.visible && new Date(post.postDate).getTime() <= Date.now())
                cb(post);
            else{
                if(!mongoose.Types.ObjectId.isValid(userData.userId)){
                    cb(null);
                    return;
                }
                User.findOne({_id : userData.userId, userKey : userData.userKey})
                .populate('group')
                .exec( (err, usr) => {
                    if(err) {
                        cb(null);
                        throw err;
                    }
                    if(!usr || !usr.group.permissions.can_editBlogPosts) {
                        cb(null);
                        return;
                    }
                    cb(post);
                });
            }
        });
    });

    socket.on(`client > server get portfolioPost`, (data, cb) => {
        const {postId, userData} = data;
        if(!mongoose.Types.ObjectId.isValid(postId)){
            cb(null);
            return;
        }
        PortfolioPost.findOne({_id : postId})
        .exec( (err, post) => {
            if(err){
                cb(null);
                return;
            }
            if(!post){
                cb(null); return;
            }
            if(post.visible && new Date(post.postDate).getTime() <= Date.now())
                cb(post);
            else{
                if(!mongoose.Types.ObjectId.isValid(userData.userId)){
                    cb(null);
                    return;
                }
                User.findOne({_id : userData.userId, userKey : userData.userKey})
                .populate('group')
                .exec( (err, usr) => {
                    if(err) {
                        cb(null);
                        throw err;
                    }
                    if(!usr || !usr.group.permissions.can_editPortfolioPosts) {
                        cb(null);
                        return;
                    }
                    cb(post);
                });
            }
        });
    });

    socket.on(`client > server get goodiesPost`, (data, cb) => {
        const {postId, userData} = data;
        if(!mongoose.Types.ObjectId.isValid(postId)){
            cb(null);
            return;
        }
        GoodiesPost.findOne({_id : postId, visible : true})
        .exec( (err, post) => {
            if(err){
                cb(null);
                return;
            }
            if(!post){
                cb(null); return;
            }
            if(post.visible && new Date(post.postDate).getTime() <= Date.now())
                cb(post);
            else{
                if(!mongoose.Types.ObjectId.isValid(userData.userId)){
                    cb(null);
                    return;
                }
                User.findOne({_id : userData.userId, userKey : userData.userKey})
                .populate('group')
                .exec( (err, usr) => {
                    if(err) {
                        cb(null);
                        throw err;
                    }
                    if(!usr || !usr.group.permissions.can_editGoodiesPosts) {
                        cb(null);
                        return;
                    }
                    cb(post);
                });
            }
        });
    });

    socket.on(`client > server get pageId with key`, (pageKey, cb) => {
        TabPage.findOne({pageKey}).select('_id')
        .exec( (err, page) => {
            if(err) throw err;
            cb(page._id);
        });
    });

    socket.on(`client > server get blog ReadMore`, (postId, tags, catType, cb) => {
        if(!tags && !catType) return;
        if(!catType.length) catType = undefined;
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        BlogPost.find({
            _id : {$ne : postId},
            visible : true,
            postDate : {$lte : Date.now()},
            $or : [
                {tags : {$in : tags}},
                {catType : catType}
            ]
        })
        .limit(5)
        .exec( (err, posts) => {
            if(err) throw err;
            cb(posts);
        });
    });

    socket.on(`client > server incrementView blogPost`, (postId) => {
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        BlogPost.findOneAndUpdate({_id : postId}, {$inc: {views : 1}}, {new : true}, (err, post) => {
            if(err) throw err;
            if(!post) return;
            io.emit(`server > client newView blogPost ${postId}`, post.views);
        });
    });

    socket.on(`client > server incrementView portfolioPost`, (postId) => {
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        PortfolioPost.findOneAndUpdate({_id : postId}, {$inc: {views : 1}}, {new : true}, (err, post) => {
            if(err) throw err;
            if(!post) return;
            io.emit(`server > client newView portfolioPost ${postId}`, post.views);
        });
    });

    socket.on(`client > server incrementView goodiesPost`, (postId) => {
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        GoodiesPost.findOneAndUpdate({_id : postId}, {$inc: {views : 1}}, {new : true}, (err, post) => {
            if(err) throw err;
            if(!post) return;
            io.emit(`server > client newView goodiesPost ${postId}`, post.views);
        });
    });

    socket.on(`client > server get comments`, (data, cb) => {
        const {postId, pageId, howMany, parentId} = data;
        let sortVal = -1;
        if(parentId != undefined) sortVal = 1;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(pageId)){
            return;
        }
        Comment.find({postId, pageId, visible : true, parentId})
        .limit(howMany)
        .sort({"postDate": sortVal})
        .populate("author", "-password")
        .exec( (err, comments) => {
            if(err) throw err;
            cb(comments);
        });
    });

    socket.on(`client > server get commentsCount`, (data, cb) => {
        const {parentId, postId, pageId} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(pageId)){
            return;
        }
        Comment.countDocuments(
            {postId, pageId, visible : true, parentId},
            (err, commentsCount) => {
                if(err) throw err;
                cb(commentsCount);
            }
        );
    });

    socket.on(`client > server post comment`, (data) => {
        let {message, userData, postId, pageId, parentId, pageKey} = data;
        message = message.replace(/\s+/g,' ').trim();
        if(!message.length) return;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(pageId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate("group")
        .exec( (err, user) => {
            if(err) throw err;
            if(!user) return;
            if(!user.group.permissions.can_postComments) return;
            const newComment = new Comment;
            newComment.content = message;
            newComment.author = userData.userId;
            newComment.postId = postId;
            newComment.pageId = pageId;
            newComment.parentId = parentId;
            newComment.save((err, com) => {
                if(err) throw err;
                io.emit(`server > client new comment${((parentId != undefined)?(` ${parentId}`):(''))} ${pageId} ${postId}`);
                io.emit(`server > client refresh commentsCount ${postId}`);
                notifyStaff(pageKey, {
                    type : 'newComment',
                    postDate : com.postDate,
                    content : {
                        id : postId,
                        postDate : com.postDate
                    }
                });
            });
        });
    });

    socket.on(`client > server delete comment`, (userData, comment) => {
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey: userData.userKey})
        .populate("group")
        .exec( (err, user) => {
            if(err) throw err;
            if(!user) return;
            if(!user.group.permissions.can_deleteComments && !user.group.permissions.can_deleteOwnComments && user._id != userData.userId) return;
            Comment.findOneAndDelete({_id: comment._id}, (err)=>{
                if(err) throw err;
                io.emit(`server > client delete comment${((comment.parentId != undefined)?(` ${comment.parentId}`):(''))} ${comment.pageId} ${comment.postId}`);
                io.emit(`server > client refresh commentsCount ${comment.postId}`);
            });
        });
    });

    socket.on(`client > server edit comment`, (data) => {
        let {message, userData, comment} = data;
        message = message.replace(/\s+/g,' ').trim();
        if(!message.length) return;
        if(message == comment.content) return;
        
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey: userData.userKey})
        .populate("group")
        .exec( (err, user) => {
            if(err) throw err;
            if(!user) return;
            if(!user.group.permissions.can_editComments && !user.group.permissions.can_editOwnComments && user._id != userData.userId) return;
            Comment.findOneAndUpdate({_id: comment._id}, {content : message, edited : {isEdited: true, editTime: Date.now()}}, (err)=>{
                if(err) throw err;
                io.emit(`server > client edit comment${((comment.parentId != undefined)?(` ${comment.parentId}`):(''))} ${comment.pageId} ${comment.postId}`);
            });
        });
    });

    socket.on(`client > server get alsoOnPlatform`, (postId, platform, cb) => {
        if(!mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        GoodiesPost.find({_id : {$ne : postId}, platform : {$in : platform}})
        .limit(4)
        .sort({"postDate" : -1})
        .exec( (err, posts) => {
            if(err) throw err;
            cb(posts);
        });
    });

    socket.on(`client > server get changelogs`, (cb) => {
        Changelog.find()
        .populate("goodieId", "title")
        .exec( (err, changelogs) => {
            if(err) throw err;
            if(changelogs && changelogs.length) cb(changelogs);
        });
    });

    socket.on(`client > server get changelog`, (changelogId, cb) => {
        if(!mongoose.Types.ObjectId.isValid(changelogId)){
            return;
        }
        Changelog.findOne({_id : changelogId})
        .exec( (err, changelog) => {
            if(err) throw err;
            if(changelog) cb(changelog);
        });
    });

    socket.on(`client > server get main Changelog`, (cb) => {
        Changelog.findOne({isMain : true})
        .exec( (err, changelog) => {
            if(err) throw err;
            if(changelog) cb(changelog);
        });
    });

    socket.on(`client > server has main Changelog`, (cb) => {
        Changelog.findOne({isMain : true})
        .exec( (err, changelog) => {
            if(err) throw err;
            if(changelog) cb(true);
            else cb(false);
        });
    });

    socket.on(`client > server changelog editVersions`, (userData, chId, newVersions) => {
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .select('group')
        .populate('group')
        .exec( (err, user) => {
            if(err) throw err;
            if(!user) return;
            if(user.group.permissions.can_editChangelogs){
                Changelog.findOneAndUpdate({_id: chId}, {versions : newVersions}, {new : true}, (err, ch) => {
                    if(err) throw err;
                    io.emit(`server > client refresh changelog ${ch._id}`, ch);
                    io.emit(`server > client refresh changelogs`);
                });
            }
        });
    });

    socket.on(`client > server uploadImage`, (data, cb) => {
        
        let upDir = '/temp';
        if(data.uploadPath != undefined) upDir = data.uploadPath;
        let uploadDir = path.join(__dirname, `../../dist/uploads/images${upDir}/`);
        if(__devmode) uploadDir = path.join(__dirname, `../../client/public/uploads/images${upDir}/`);

        let extensions = ['png', 'gif', 'svg', 'jpg', 'jpeg'];
        if(data.extensions != undefined) extensions = data.extensions;

        if(!data.files || !data.files.length){
            cb({error : true, errors: ['no files detected']});
            return;
        }
        let cbRes = {
            error : false,
            errors : [],
            urls : []
        }

        for(let i = 0; i < data.files.length; ++i){
            if(data.files[i].data == undefined){
                cbRes.error = true;
                cbRes.errors.push(`there was a problem with the upload`);
                break;
            }

            buffer = data.files[i].data;

            // let fileName = `${Date.now()}${data.files[i].name}`;
            // fileName = fileName.replace(/\s/g, '');
            let extension = data.files[i].name.split('.').pop();
            let fileName = `${Date.now()}${Math.floor(Math.random() * 1000)}.${extension}`;
            let fileDir =  `${uploadDir}${fileName}`;

            if(extensions.indexOf(extension) == -1) {
                cbRes.error = true;
                cbRes.errors.push(`forbidden extension for ${data.files[i].name}`);
                break;
            }

            fs.open(fileDir, 'w', (err, fd) => {
                if (err) {
                    cbRes.error = true;
                    cbRes.errors.push(`error opening file ${data.files[i].name}`);
                    throw ('error opening file: ' + err);
                }

                fs.write(fd, buffer, 0, buffer.length, null, (err) => {
                    if (err) {
                        cbRes.error = true;
                        cbRes.errors.push(`error writing file ${data.files[i].name}`);
                        throw ('error writing file: ' + err);
                    }
                    fs.close(fd, function() {
                        cbRes.urls.push(`${__domain}/uploads/images${upDir}/${fileName}`);
                        if(i == data.files.length - 1){
                            cb(cbRes);
                        }
                    })
                });
            });
        }

    });

    socket.on(`client > server blogPosts setFeatured`, (data) => {
        const {userData, postId, featured} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editBlogPosts) return;
            BlogPost.findOneAndUpdate({_id : postId}, {featured}, (err) => {
                if(err) throw err;
                io.emit(`server > client refresh blogPosts`);
                io.emit(`server > client refresh BlogPost ${postId}`);
            });
        });
    });

    socket.on(`client > server portfolioPosts setFeatured`, (data) => {
        const {userData, postId, featured} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editPortfolioPosts) return;
            PortfolioPost.findOneAndUpdate({_id : postId}, {featured}, (err) => {
                if(err) throw err;
                io.emit(`server > client refresh portfolioPosts`);
                io.emit(`server > client refresh portfolioPost ${postId}`);
            });
        });
    });

    socket.on(`client > server goodiesPosts setFeatured`, (data) => {
        const {userData, postId, featured} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editGoodiesPosts) return;
            GoodiesPost.findOneAndUpdate({_id : postId}, {featured}, (err) => {
                if(err) throw err;
                io.emit(`server > client refresh goodiesPosts`);
                io.emit(`server > client refresh goodiesPost ${postId}`);
            });
        });
    });

    socket.on(`client > server blogPosts setVisible`, (data) => {
        const {userData, postId, visible} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editBlogPosts) return;
            BlogPost.findOneAndUpdate({_id : postId}, {visible}, (err) => {
                if(err) throw err;
                io.emit(`server > client refresh blogPosts`);
                io.emit(`server > client refresh BlogPost ${postId}`);
            });
        });
    });

    socket.on(`client > server portfolioPosts setVisible`, (data) => {
        const {userData, postId, visible} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editPortfolioPosts) return;
            PortfolioPost.findOneAndUpdate({_id : postId}, {visible}, (err) => {
                if(err) throw err;
                io.emit(`server > client refresh portfolioPosts`);
                io.emit(`server > client refresh portfolioPost ${postId}`);
            });
        });
    });

    socket.on(`client > server goodiesPosts setVisible`, (data) => {
        const {userData, postId, visible} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editGoodiesPosts) return;
            GoodiesPost.findOneAndUpdate({_id : postId}, {visible}, (err) => {
                if(err) throw err;
                io.emit(`server > client refresh goodiesPosts`);
                io.emit(`server > client refresh goodiesPost ${postId}`);
            });
        });
    });

    socket.on(`client > server delete blogPost`, (data) => {
        const {userData, postId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_deleteBlogPosts) return;
            BlogPost.findOneAndDelete({_id : postId})
            .exec( (err) => {
                if(err) throw err;
                Promise.all([
                    Comment.deleteMany({ postId }),
                    Like.deleteMany({post : postId})
                  ]).then( () => {
                      io.emit(`server > client refresh blogPosts`);
                      io.emit(`server > client refresh BlogPost ${postId}`);
                  });
            });
        });
    });

    socket.on(`client > server delete portfolioPost`, (data) => {
        const {userData, postId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_deletePortfolioPosts) return;
            PortfolioPost.findOneAndDelete({_id : postId})
            .exec( (err) => {
                if(err) throw err;
                Promise.all([
                    Comment.deleteMany({ postId }),
                    Like.deleteMany({post : postId})
                  ]).then( () => {
                      io.emit(`server > client refresh portfolioPosts`);
                      io.emit(`server > client refresh portfolioPost ${postId}`);
                  });
            });
        });
    });

    socket.on(`client > server delete goodiesPost`, (data) => {
        const {userData, postId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(postId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_deleteGoodiesPosts) return;
            GoodiesPost.findOneAndDelete({_id : postId})
            .exec( (err) => {
                if(err) throw err;
                Promise.all([
                    Comment.deleteMany({ postId }),
                    Like.deleteMany({post : postId}),
                    BugReport.deleteMany({goodieId : postId})
                  ]).then( () => {
                      io.emit(`server > client refresh goodiesPosts`);
                      io.emit(`server > client refresh goodiesPost ${postId}`);
                  });
            });
        });
    });

    socket.on(`client > server edit BlogPost get`, (data, cb) => {
        const {userData, postId} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            cb(null);
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) {
                cb(null);
                throw err;
            }
            if(!usr || !usr.group.permissions.can_editBlogPosts){
                cb(null);
                return;
            }
            BlogPost.findOne({_id : postId})
            .populate('author', '-password')
            .exec( (err, bpost) => {
                if(err){
                    cb(null);
                    throw err;
                }
                cb(bpost);
            });
        });
    });

    socket.on(`client > server edit PortfolioPost get`, (data, cb) => {
        const {userData, postId} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            cb(null);
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) {
                cb(null);
                throw err;
            }
            if(!usr || !usr.group.permissions.can_editPortfolioPosts){
                cb(null);
                return;
            }
            PortfolioPost.findOne({_id : postId})
            .exec( (err, ppost) => {
                if(err){
                    cb(null);
                    throw err;
                }
                cb(ppost);
            });
        });
    });

    socket.on(`client > server edit GoodiesPost get`, (data, cb) => {
        const {userData, postId} = data;
        if(!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userData.userId)){
            cb(null);
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) {
                cb(null);
                throw err;
            }
            if(!usr || !usr.group.permissions.can_editGoodiesPosts){
                cb(null);
                return;
            }
            GoodiesPost.findOne({_id : postId})
            .exec( (err, gpost) => {
                if(err){
                    cb(null);
                    throw err;
                }
                cb(gpost);
            });
        });
    });

    socket.on(`client > server get categories`, (pageKey, cb) => {
        TabPage.findOne({pageKey})
        .select('categories')
        .exec( (err, tp) => {
            if(err) throw err;
            if(tp) cb(tp.categories);
        });
    });

    socket.on(`client > server edit blogPost`, (data, cb) => {
        const {userData, post} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(post._id)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editBlogPosts) return;
            let errors = {
                title : [],
                subTitle : [],
                content : [],
                cover : [],
                likes : [],
                views : [],
                featured : [],
                visible : [],
                postDate : [],
                author : [],
                catType : [],
                tags : [],
                showComments : []
            };
            let error = false;

            let changes = {
                $set : {...post}
            }

            if(post.author != undefined && !mongoose.Types.ObjectId.isValid(post.author)){
                error = true;
                errors.author.push('invalid user!');
            }
            if(post.author == undefined){
                changes['$unset'] = { author : undefined };
                delete changes['$set'].author;
            }

            if(post.title && post.title.length > 50){
                error = true;
                errors.title.push(`no more than 50 characters!`);
            }

            if(!post.title || !post.title.length){
                error = true;
                errors.title.push(`you must have a title!`);
            }

            if(post.subTitle && post.subTitle.length > 50){
                error = true;
                errors.subTitle.push(`no more than 50 characters!`);
            }

            if(!post.content || !post.content.length){
                error = true;
                errors.content.push(`your article must have content!`);
            }

            if(!post.cover || !post.cover.length){
                error = true;
                errors.cover.push(`your article must have a cover photo!`);
            }

            if(post.likes < 0){
                error = true;
                errors.likes.push(`no negative numbers!`);
            }

            if(post.views < 0){
                error = true;
                errors.views.push(`no negative numbers!`);
            }

            changes['$set'].postDate = post.postDate || Date.now();

            if(error){
                cb({success : false, errors});
                return;
            }

            BlogPost.findOneAndUpdate({_id : post._id}, changes, {new : true}, (err, editedPost) => {
                if(err) throw err;
                io.emit(`server > client refresh blogPosts`);
                io.emit(`server > client refresh BlogPost ${post._id}`);
                cb({success : true, errors : {}, _id : editedPost._id, title : editedPost.title});
            });

        });
    });

    socket.on(`client > server edit portfolioPost`, (data, cb) => {
        const {userData, post} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(post._id)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editPortfolioPosts) return;
            let errors = {
                title : [],
                subTitle : [],
                description : [],
                images : [],
                likes : [],
                views : [],
                featured : [],
                visible : [],
                postDate : [],
                catType : [],
                tags : [],
                showComments : []
            };
            let error = false;

            if(post.title && post.title.length > 50){
                error = true;
                errors.title.push(`no more than 50 characters!`);
            }

            if(!post.title || !post.title.length){
                error = true;
                errors.title.push(`you must have a title!`);
            }

            if(post.subTitle && post.subTitle.length > 50){
                error = true;
                errors.subTitle.push(`no more than 50 characters!`);
            }

            if(!post.images || !post.images.length){
                error = true;
                errors.images.push(`your post must have an image!`);
            }

            if(post.likes < 0){
                error = true;
                errors.likes.push(`no negative numbers!`);
            }

            if(post.views < 0){
                error = true;
                errors.views.push(`no negative numbers!`);
            }

            post.postDate = post.postDate || Date.now();

            if(error){
                cb({success : false, errors});
                return;
            }

            PortfolioPost.findOneAndUpdate({_id : post._id}, {...post}, {new : true}, (err, editedPost) => {
                if(err) throw err;
                io.emit(`server > client refresh portfolioPosts`);
                io.emit(`server > client refresh PortfolioPost ${post._id}`);
                cb({success : true, errors : {}, _id : editedPost._id, title : editedPost.title});
            });

        });
    });

    socket.on(`client > server edit goodiesPost`, (data, cb) => {
        const {userData, post} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(post._id)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editGoodiesPosts) return;
            let errors = {
                title : [],
                subTitle : [],
                description : [],
                cover : [],
                likes : [],
                views : [],
                featured : [],
                visible : [],
                postDate : [],
                catType : [],
                tags : [],
                releaseDate : [],
                updateDate : [],
                version : [],
                platform : [],
                showAlsoOnPlatform : [],
                showComments : [],
                allowBugReport : [],
                downloadUrl : [],
                showChangelog : [],
                changelog : []
            };
            let error = false;

            if(post.title && post.title.length > 50){
                error = true;
                errors.title.push(`no more than 50 characters!`);
            }

            if(!post.title || !post.title.length){
                error = true;
                errors.title.push(`you must have a title!`);
            }

            if(!post.description || !post.description.length){
                error = true;
                errors.description.push(`you must have a description!`);
            }

            if(post.subTitle && post.subTitle.length > 50){
                error = true;
                errors.subTitle.push(`no more than 50 characters!`);
            }

            if(!post.cover){
                error = true;
                errors.cover.push(`your post must have a cover image!`);
            }

            if(post.likes < 0){
                error = true;
                errors.likes.push(`no negative numbers!`);
            }

            if(post.views < 0){
                error = true;
                errors.views.push(`no negative numbers!`);
            }

            post.postDate = post.postDate || Date.now();

            if(error){
                cb({success : false, errors});
                return;
            }

            GoodiesPost.findOneAndUpdate({_id : post._id}, {...post}, {new : true}, (err, editedPost) => {
                if(err) throw err;
                io.emit(`server > client refresh goodiesPosts`);
                io.emit(`server > client refresh GoodiesPost ${post._id}`);
                cb({success : true, errors : {}, _id : editedPost._id, title : editedPost.title});
            });

        });
    });

    socket.on(`client > server add new blogPost`, (data, cb) => {
        const {userData, post} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_writeBlogPosts) return;
            let errors = {
                title : [],
                subTitle : [],
                content : [],
                cover : [],
                likes : [],
                views : [],
                featured : [],
                visible : [],
                postDate : [],
                author : [],
                catType : [],
                tags : [],
                showComments : []
            };
            let error = false;

            if(post.author != undefined && !mongoose.Types.ObjectId.isValid(post.author)){
                error = true;
                errors.author.push('invalid user!');
            }

            if(post.title && post.title.length > 50){
                error = true;
                errors.title.push(`no more than 50 characters!`);
            }

            if(!post.title || !post.title.length){
                error = true;
                errors.title.push(`you must have a title!`);
            }

            if(post.subTitle && post.subTitle.length > 50){
                error = true;
                errors.subTitle.push(`no more than 50 characters!`);
            }

            if(!post.content || !post.content.length){
                error = true;
                errors.content.push(`your article must have content!`);
            }

            if(!post.cover || !post.cover.length){
                error = true;
                errors.cover.push(`your article must have a cover photo!`);
            }

            if(post.likes < 0){
                error = true;
                errors.likes.push(`no negative numbers!`);
            }

            if(post.views < 0){
                error = true;
                errors.views.push(`no negative numbers!`);
            }

            post.postDate = post.postDate || Date.now();

            if(error){
                cb({success : false, errors});
                return;
            }

            let newBlogPost = new BlogPost;
            for(let k in post){
                newBlogPost[k] = post[k];
            }

            newBlogPost.save( (err, newPost) => {
                if(err) throw err;
                io.emit(`server > client refresh blogPosts`);
                io.emit(`server > client refresh BlogPost ${newPost._id}`);
                cb({success : true, errors : {}, _id : newPost._id, title : newPost.title});

                if(newPost.visible) {
                    addPageNotification('blog', {
                        type : 'newBlogPost',
                        postDate : newPost.postDate,
                        content : {
                            title : newPost.title,
                            id : newPost._id,
                            postDate : newPost.postDate
                        }
                    });
                }
            });

        });
    });

    socket.on(`client > server add new portfolioPost`, (data, cb) => {
        const {userData, post} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_writePortfolioPosts) return;
            let errors = {
                title : [],
                subTitle : [],
                description : [],
                images : [],
                likes : [],
                views : [],
                featured : [],
                visible : [],
                postDate : [],
                catType : [],
                tags : [],
                showComments : []
            };
            let error = false;

            if(post.title && post.title.length > 50){
                error = true;
                errors.title.push(`no more than 50 characters!`);
            }

            if(!post.title || !post.title.length){
                error = true;
                errors.title.push(`you must have a title!`);
            }

            if(post.subTitle && post.subTitle.length > 50){
                error = true;
                errors.subTitle.push(`no more than 50 characters!`);
            }

            if(!post.images || !post.images.length){
                error = true;
                errors.images.push(`your post must have an image!`);
            }

            if(post.likes < 0){
                error = true;
                errors.likes.push(`no negative numbers!`);
            }

            if(post.views < 0){
                error = true;
                errors.views.push(`no negative numbers!`);
            }

            post.postDate = post.postDate || Date.now();

            if(error){
                cb({success : false, errors});
                return;
            }

            let newPortfolioPost = new PortfolioPost;
            for(let k in post){
                newPortfolioPost[k] = post[k];
            }

            newPortfolioPost.save( (err, newPost) => {
                if(err) throw err;
                io.emit(`server > client refresh portfolioPosts`);
                io.emit(`server > client refresh PortfolioPost ${newPost._id}`);
                cb({success : true, errors : {}, _id : newPost._id, title : newPost.title});
                
                if(newPost.visible) {
                    addPageNotification('portfolio', {
                        type : 'newPortfolioPost',
                        postDate : newPost.postDate,
                        content : {
                            title : newPost.title,
                            id : newPost._id,
                            postDate : newPost.postDate
                        }
                    });
                }
            });

        });
    });

    socket.on(`client > server add new goodiesPost`, (data, cb) => {
        const {userData, post} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_writeGoodiesPosts) return;
            let errors = {
                title : [],
                subTitle : [],
                description : [],
                cover : [],
                likes : [],
                views : [],
                featured : [],
                visible : [],
                postDate : [],
                catType : [],
                tags : [],
                releaseDate : [],
                updateDate : [],
                version : [],
                platform : [],
                showAlsoOnPlatform : [],
                showComments : [],
                allowBugReport : [],
                downloadUrl : [],
                showChangelog : [],
                changelog : []
            };
            let error = false;

            if(post.title && post.title.length > 50){
                error = true;
                errors.title.push(`no more than 50 characters!`);
            }

            if(!post.title || !post.title.length){
                error = true;
                errors.title.push(`you must have a title!`);
            }

            if(!post.description || !post.description.length){
                error = true;
                errors.description.push(`you must have a description!`);
            }

            if(post.subTitle && post.subTitle.length > 50){
                error = true;
                errors.subTitle.push(`no more than 50 characters!`);
            }

            if(!post.cover){
                error = true;
                errors.cover.push(`your post must have a cover image!`);
            }

            if(post.likes < 0){
                error = true;
                errors.likes.push(`no negative numbers!`);
            }

            if(post.views < 0){
                error = true;
                errors.views.push(`no negative numbers!`);
            }

            post.postDate = post.postDate || Date.now();

            if(error){
                cb({success : false, errors});
                return;
            }

            let newGoodiesPost = new GoodiesPost;
            for(let k in post){
                newGoodiesPost[k] = post[k];
            }

            newGoodiesPost.save( (err, newPost) => {
                if(err) throw err;
                io.emit(`server > client refresh goodiesPosts`);
                io.emit(`server > client refresh GoodiesPost ${newPost._id}`);
                cb({success : true, errors : {}, _id : newPost._id, title : newPost.title});
                
                if(newPost.visible) {
                    addPageNotification('goodies', {
                        type : 'newGoodiesPost',
                        postDate : newPost.postDate,
                        content : {
                            title : newPost.title,
                            id : newPost._id,
                            postDate : newPost.postDate
                        }
                    });
                }
            });

        });
    });

    
    socket.on(`client > server create Changelog`, (data, cb = null) => {
        const {userData, title, goodieId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editChangelogs) return;

            let newChangelog = new Changelog;
            newChangelog.title = title;
            newChangelog.goodieId = goodieId;

            newChangelog.save( (err, newCh) => {
                if(err) throw err;
                if(cb) cb(newCh);

                if(!mongoose.Types.ObjectId.isValid(goodieId)){
                    return;
                }

                GoodiesPost.findOneAndUpdate({_id : goodieId}, {changelog : newCh._id}, {new : true}, (err, editedPost) => {
                    if(err) throw err;
                    io.emit(`server > client refresh goodiesPosts`);
                    io.emit(`server > client refresh GoodiesPost ${editedPost._id}`);
                });

            });
        });
    });
    
    socket.on(`client > server delete Changelog`, (data, cb = null) => {
        const {userData, id} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(id)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .populate('group')
        .exec( (err, usr) => {
            if(err) throw err;
            if(!usr || !usr.group.permissions.can_editChangelogs) return;

            Changelog.findOneAndDelete({_id : id}, (err, oldCh) => {
                if(err) throw err;
                if(!oldCh.goodieId || !mongoose.Types.ObjectId.isValid(oldCh.goodieId)) {if(cb) cb({success : true});}
                else{
                    
                    GoodiesPost.findOneAndUpdate({_id : oldCh.goodieId}, {$set : {showChangelog: false}, $unset: {changelog : undefined}}, (err, goodie) => {
                        if(err) throw err;
                        io.emit(`server > client refresh goodiesPosts`);
                        io.emit(`server > client refresh GoodiesPost ${goodie._id}`);
                        cb({success : true});
                    });
                }

            });
        });
    });

    socket.on(`client > server get bugreport goodies`, (cb) => {
        GoodiesPost.find({allowBugReport : true, visible : true, postDate : {$lte : Date.now()}})
        .select('title')
        .exec( (err, posts) => {
            if(err) throw err;
            cb(posts);
        });
    });

    socket.on(`client > server add new bugReport`, (data, cb) => {
        let {userData, post} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        let errors = {
            title : [],
            author : [],
            goodieId : [],
            categories : [],
            description : []
        };
        let error = false;

        if(post.title && post.title.length > 50){
            error = true;
            errors.title.push(`no more than 50 characters!`);
        }

        if(!post.title || !post.title.length){
            error = true;
            errors.title.push(`you must have a title!`);
        }

        if(!post.description || !post.description.length){
            error = true;
            errors.description.push(`you must have a description!`);
        }

        if(error){
            cb({success : false, errors});
            return;
        }

        let newBugReport = new BugReport;
        newBugReport.title = post.title;
        newBugReport.description = post.description;
        newBugReport.author = userData.userId;
        if(mongoose.Types.ObjectId.isValid(post.goodieId)){
            newBugReport.goodieId = post.goodieId;
        }
        newBugReport.save( (err, newPost) => {
            if(err) throw err;
            cb({success : true, errors : {}, _id : newPost._id});
            io.emit(`server > client refresh reports`);
            notifyStaff('support', {
                type : 'newReport',
                postDate : newPost.postDate,
                content : {
                    id : newPost._id,
                    title : newPost.title,
                    postDate : newPost.postDate
                }
            });
        });
    });

    socket.on(`client > server get bugReport`, (data, cb) => {
        let {userData, reportId} = data;

        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(reportId)){
            cb(null);
            return;
        }

        BugReport.findOne({_id : reportId})
        .populate('goodieId')
        .populate('author', '-password')
        .exec( (err, rep) => {
            if(err) {
                cb(null);
                throw err;
            }

            if(!rep) {
                cb(null);
                return;
            }
            User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    cb(null);
                    throw err;
                }
                if(!usr || (!usr.group.permissions.can_manageBugReports && usr._id != rep.author)) {
                    cb(null);
                    return;
                }

                cb(rep);
            });
        });
        
    });

    socket.on(`client > server edit state BugReport`, (data) => {
        let {userData, reportId, newState} = data;

        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(reportId)){
            return;
        }

        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    cb(null);
                    throw err;
                }
                if(!usr || !usr.group.permissions.can_manageBugReports) return;

                BugReport.findOneAndUpdate({_id : reportId}, {state : newState}, (err, rep) => {
                    if(err) throw err;
                    io.emit(`server > client refresh BugReport ${rep._id}`);
                    io.emit(`server > client refresh reports`);
                });
        });
    });

    socket.on(`client > server update user prefs`, (data, cb = null) => {
        let {userData, prefs} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }

        User.findOneAndUpdate({_id : userData.userId, userKey : userData.userKey},
            {$set : {preferences : prefs}}, {new : true}, (err, usr) => {
                if(err) throw err;
                if(cb) cb();
                io.emit(`server > client refresh user ${usr._id}`);
            });
    });

    socket.on(`client > server get user reports`, (data, cb) => {
        let {userData} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }

        BugReport.find({author : userData.userId})
        .populate('goodieId')
        .exec( (err, reps) => {
            if(err) throw err;
            cb(reps);
        });
    });

    socket.on(`client > server change user avatar`, (data, cb = null) => {
        let {userData, avatar} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }

        User.findOneAndUpdate({_id : userData.userId, userKey : userData.userKey},
            {$set : {avatar}}, {new : true}, (err, usr) => {
                if(err) throw err;
                if(cb) cb();
                io.emit(`server > client refresh user ${usr._id}`);
            });
    });

    socket.on(`client > server change user cover`, (data, cb = null) => {
        let {userData, cover} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }

        User.findOneAndUpdate({_id : userData.userId, userKey : userData.userKey},
            {$set : {cover}}, {new : true}, (err, usr) => {
                if(err) throw err;
                if(cb) cb();
                io.emit(`server > client refresh user ${usr._id}`);
            });
    });

    socket.on(`client > server edit siteSettings`, (data, cb = null) => {
        let {userData, settings} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                SiteSettings.findOneAndUpdate({}, {...settings}, (err) => {
                    if(err) throw err;
                    io.emit(`server > client refresh siteSettings`);
                    if(cb) cb();
                });
        });
    });

    socket.on(`client > server get tabPages`, (cb) => {
        TabPage.find({}).exec((err, pages) => {
            if(err) {
                cb(null);
                throw err;
            }

            cb(pages);
        });
    });

    socket.on(`client > server edit tabPage`, (data, cb = null) => {
        let {userData, page} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(page._id)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                TabPage.findOneAndUpdate({_id : page._id}, {...page}, {new : true}, (err, newTp) => {
                    if(err) {
                        if(cb) cb();
                        throw err;
                    }
                    if(cb) cb();
                    io.emit(`server > client refresh tabPages`);
                });
            });
    });

    socket.on(`client > server edit navLinks`, (data, cb = null) => {
        let {userData, link} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                if(mongoose.Types.ObjectId.isValid(link._id)) {
                    NavLink.findOneAndUpdate({_id : link._id}, {...link}, {new : true}, (err, newLink) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh navLinks`);
                    });
                }else {
                    let newLink = new NavLink();
                    newLink.title = link.title;
                    newLink.key = link.key;
                    newLink.address = link.address;
                    newLink.save((err, l) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh navLinks`);
                    });
                }

            });
    });

    socket.on(`client > server delete navLink`, (data, cb = null) => {
        let {userData, linkId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(linkId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                NavLink.findOneAndDelete({_id: linkId}, (err) => {
                    if(err) {
                        if(cb) cb();
                        throw err;
                    }
                    if(cb) cb();
                    io.emit(`server > client refresh navLinks`);
                });

            });
    });

    socket.on(`client > server edit socialLinks`, (data, cb = null) => {
        let {userData, link} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                if(mongoose.Types.ObjectId.isValid(link._id)) {
                    SocialLink.findOneAndUpdate({_id : link._id}, {...link}, {new : true}, (err, newLink) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh socialLinks`);
                    });
                }else {
                    let newLink = new SocialLink();
                    newLink.title = link.title;
                    newLink.key = link.key;
                    newLink.address = link.address;
                    newLink.save((err, l) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh socialLinks`);
                    });
                }

            });
    });

    socket.on(`client > server delete socialLink`, (data, cb = null) => {
        let {userData, linkId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(linkId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                SocialLink.findOneAndDelete({_id: linkId}, (err) => {
                    if(err) {
                        if(cb) cb();
                        throw err;
                    }
                    if(cb) cb();
                    io.emit(`server > client refresh socialLinks`);
                });

            });
    });

    socket.on(`client > server get groups`, (cb) => {
        Group.find({}, (err, groups) => {
            if(err) {
                cb(null);
                throw err;
            }

            cb(groups);
        });
    });
    
    socket.on(`client > server edit group`, (data, cb = null) => {
        let {userData, group} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                if(mongoose.Types.ObjectId.isValid(group._id)) {
                    Group.findOneAndUpdate({_id : group._id}, {...group}, {new : true}, (err, newGroup) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh groups`);
                    });
                }else {
                    let newGroup = new Group();
                    newGroup.name = group.name;
                    newGroup.isDefault = group.isDefault;
                    newGroup.isStaff = group.isStaff;
                    newGroup.permissions = group.permissions;

                    newGroup.save((err, newG) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh groups`);
                    });
                }

            });
    });

    socket.on(`client > server delete group`, (data, cb = null) => {
        let {userData, groupId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(groupId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                Group.findOneAndDelete({_id: groupId, isDefault : false}, (err) => {
                    if(err) {
                        if(cb) cb();
                        throw err;
                    }
                    if(cb) cb();
                    io.emit(`server > client refresh groups`);
                });

            });
    });

    socket.on(`client > server get users`, (cb) => {
        User.find({}).select("-password").populate("group")
        .exec( (err, users) => {
            if(err) {
                cb(null);
                throw err;
            }

            cb(users);
        });
    });

    
    socket.on(`client > server edit account`, (data, cb = null) => {
        let {userData, account} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(account._id)){
            if(cb) cb();
            return;
        }

        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                User.findOne({displayName : account.displayName, _id : {$ne : account._id}})
                .exec( (err, usr) => {
                    if(err) {
                        if(cb) cb();
                        throw err;
                    }
                    if(usr) {
                        if(cb) cb();
                        return;
                    }
                    account.group = account.group._id;
                    if(!mongoose.Types.ObjectId.isValid(account.group)){
                        if(cb) cb();
                        return;
                    }
                    User.findOneAndUpdate({_id : account._id}, {...account}, {new : true}, (err, editedUser) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh users`);
                    });
                });

            });
    });

    
    
    socket.on(`client > server edit WhatsGood item`, (data, cb = null) => {
        let {userData, item} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                if(mongoose.Types.ObjectId.isValid(item._id)) {
                    WhatsGood.findOneAndUpdate({_id : item._id}, {...item}, {new : true}, (err, newItem) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh WhatsGood items`);
                    });
                }else {
                    let newItem = new WhatsGood();
                    newItem.title = item.title;
                    newItem.key = item.key;
                    newItem.button = item.button;
                    newItem.description = item.description;

                    newItem.save((err, newI) => {
                        if(err) {
                            if(cb) cb();
                            throw err;
                        }
                        if(cb) cb();
                        io.emit(`server > client refresh WhatsGood items`);
                    });
                }

            });
    });

    
    socket.on(`client > server delete WhatsGood item`, (data, cb = null) => {
        let {userData, itemId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(itemId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                WhatsGood.findOneAndDelete({_id: itemId}, (err) => {
                    if(err) {
                        if(cb) cb();
                        throw err;
                    }
                    if(cb) cb();
                    io.emit(`server > client refresh WhatsGood items`);
                });

            });
    });

    socket.on(`client > server get reports`, (cb) => {
        BugReport.find({})
        .populate('goodieId', "title")
        .populate('author', 'displayName')
        .exec((err, reports) => {
            if(err) {
                cb([]);
                throw err;
            }
            cb(reports);
        });
    });

    socket.on(`client > server delete BugReport`, (data, cb = null) => {
        let {userData, reportId} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(reportId)){
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                BugReport.findOneAndDelete({_id: reportId}, (err) => {
                    if(err) {
                        if(cb) cb();
                        throw err;
                    }
                    if(cb) cb();
                    io.emit(`server > client refresh reports`);
                });

            });
    });

    socket.on(`client > server get Terms`, (key, cb) => {
        Terms.findOne({key})
        .exec( (err, term) => {
            if(err){
                cb(null);
                throw err;
            }
            cb(term);
        });
    });
    
    socket.on(`client > server edit Terms`, (data, cb = null) => {
        let {userData, terms} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) && !mongoose.Types.ObjectId.isValid(terms._id)){
            if(cb) cb();
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .populate('group')
            .exec( (err, usr) => {
                if(err) {
                    if(cb) cb();
                    throw err;
                }
                if(!usr || !usr.group.isStaff) return;

                Terms.findOneAndUpdate({_id : terms._id}, {title : terms.title, content : terms.content, lastUpdate : Date.now()}, (err, term) => {
                    if(err) {
                        if(cb) cb();
                        throw err;
                    }
                    if(cb) cb();
                    io.emit(`server > client refresh Terms ${term.key}`);
                });

            });
    });

    socket.on(`client > server changePassword`, (data, cb) => {
        let {userData, password, newPassword, reNewPassword} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            cb({success : false});
            return;
        }
        
        User.findOne({_id : userData.userId, userKey : userData.userKey})
            .exec( (err, usr) => {
                if(err) {
                    cb({success : false});
                    throw err;
                }
                if(!usr) return;

                let errors = {
                    password : '',
                    newPassword : '',
                    reNewPassword : ''
                }

                let canDo = true;

                if(!usr.validPassword(password)) {
                    canDo = false;
                    errors.password = `wrong password!`;
                }

                let newPass = usr.generateHash(newPassword);

                if(!canDo) {
                    cb({success : false, errors});
                    return;
                }

                User.findOneAndUpdate({_id : userData.userId}, {password: newPass}, (err, editedUsr) => {
                    if(err) {
                        cb({success : false});
                        throw err;
                    }
                    cb({success : true});
                });

            });
    });


    socket.on('client > server get userNotificationCount', (data, cb) => {
        let {userId} = data;
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return;
        }
        
        let dateNow = Date.now();
        UserNotifications.countDocuments({user : userId, seen : false, postDate : {$lte : dateNow}})
        .exec((err, cnt) => {
            if(err) throw err;
            cb(cnt);
        });
    });

    socket.on('client > server get userNotifications', (data, cb) => {
        let {userId} = data;
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return;
        }
        
        let dateNow = Date.now();
        UserNotifications.updateMany({user : userId, postDate : {$lte : dateNow}}, {seen : true})
        .exec((err, notifications) => {
            if(err) throw err;
            io.emit(`server > client refresh userNotificationCount ${userId}`);
        });
        UserNotifications.find({user : userId, postDate : {$lte : dateNow}})
        .sort({postDate : -1})
        .exec((err, notifications) => {
            if(err) throw err;
            cb(notifications);
        });
    });

    socket.on(`client > server get post commentsCount`, (data, cb) => { 
        let {postId} = data;
        if(!mongoose.Types.ObjectId.isValid(postId)) {
            return;
        }
        Comment.countDocuments({postId})
        .exec((err, cnt) => {
            if(err) throw err;
            cb(cnt);
        });
    });

    socket.on('client > server delete notification', (data) => {
        let {notificationId, userId} = data;
        if(!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(notificationId)){
            return;
        }
        UserNotifications.findOneAndDelete({_id : notificationId, user : userId}, (err) => {
            if(err) throw err;
            io.emit(`server > client refresh notifications ${userId}`);
        });
    });

    socket.on('client > server add new ContactMessage', (data, cb) => {
        let {userData, title, content, budget, type} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .select('group')
        .populate('group')
        .exec( (err, user) => {
            if(err) throw err;
            if(!user) return;
            if(user.group.permissions.can_sendContactMessage){
                let canDo = true;
                let errors = {};
                if(isEmpty(title)) {
                    canDo = false;
                    errors.title = `you must add a title!`;
                }
                if(isEmpty(content)) {
                    canDo = false;
                    errors.content = `you must add a description!`;
                }

                if(!canDo) {
                    cb({
                        success : false,
                        errors
                    });
                    return;
                }
                let newContactMessage = new ContactMessage();
                newContactMessage.title = title;
                newContactMessage.content = content;
                newContactMessage.budget = budget;
                newContactMessage.type = type;
                newContactMessage.author = userData.userId;

                newContactMessage.save( (err, doc) => {
                    if(err) throw err;
                    cb({
                        success : true,
                        id : doc._id
                    });
                    notifyStaff('contact', {
                        type : 'newContactMessage',
                        postDate : doc.postDate,
                        content : {
                            id : doc._id,
                            title : doc.title,
                            postDate : doc.postDate
                        }
                    });
                });
            }
        });
    });

    
    socket.on('client > server get ContactMessage', (data, cb) => {
        let {messageId} = data;
        
        if(!mongoose.Types.ObjectId.isValid(messageId)){
            cb(0);
            return;
        }
        ContactMessage.findOne({_id : messageId})
        .sort({postDate : -1})
        .populate({path : 'replies', populate : {path: 'author'}})
        .populate('author')
        .exec( (err, doc) => {
            if(err) {
                cb(0);
                throw err;
            }
            cb(doc);
        });
    });
    
    socket.on('client > server get user ContactMessages', (data, cb) => {
        let {userId} = data;
        
        if(!mongoose.Types.ObjectId.isValid(userId)){
            return;
        }
        ContactMessage.find({author : userId})
        .sort({postDate : -1})
        .exec( (err, docs) => {
            if(err) {
                throw err;
            }
            cb(docs);
        });
    });

    socket.on('client > server change state ContactMessage', (data) => {
        let {userData, messageId, newState} = data;
        if(!mongoose.Types.ObjectId.isValid(userData.userId) || !mongoose.Types.ObjectId.isValid(messageId)){
            return;
        }
        User.findOne({_id : userData.userId, userKey : userData.userKey})
        .select('group')
        .populate('group')
        .exec( (err, user) => {
            if(err) throw err;
            if(!user) return;
            if(user.group.isStaff){
                ContactMessage.findOneAndUpdate({_id : messageId}, {state : newState}, {new : true}, (err, doc) => {
                    if(err) throw err;
                    io.emit(`server > client refresh ContactMessage ${doc._id}`);
                    let nowDate = Date.now();
                    notifyUsers([doc.author], 'contact', {
                        type : 'contactStatusChange',
                        postDate : nowDate,
                        content : {
                            id : doc._id,
                            newState : doc.state,
                            title : doc.title,
                            postDate : nowDate
                        }
                    });
                });
            }
        });
    });

    socket.on('client > server add new ContactRepy', (data) => {
        let {userId, messageId, message, staffMessage} = data;
        if(!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(messageId) || isEmpty(message)){
            return;
        }
        let newContactReply = new ContactReply();
        newContactReply.author = userId;
        newContactReply.contactMessageParent = messageId;
        newContactReply.content = message;
        newContactReply.staffMessage = staffMessage;

        newContactReply.save( (err, reply) => {
            if(err) throw err;
            ContactMessage.findOneAndUpdate({_id : messageId}, {$push : {replies : reply._id}}, (err, msg) => {
                if(err) throw err;
                io.emit(`server > client refresh ContactMessage ${msg._id}`);
                let nowDate = Date.now();
                if(staffMessage) {
                    notifyUsers([msg.author], 'contact', {
                        type : 'newContactReply',
                        postDate : nowDate,
                        content : {
                            id : msg._id,
                            newState : msg.state,
                            title : msg.title,
                            postDate : nowDate
                        }
                    });
                }
                
                notifyStaff('contact', {
                    type : 'newContactReply_staff',
                    postDate : nowDate,
                    content : {
                        id : msg._id,
                        newState : msg.state,
                        title : msg.title,
                        postDate : nowDate
                    }
                });
            });
        });
    });
}

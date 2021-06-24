module.exports = app => {
    var ObjectId = require('mongodb').ObjectID;
    var router = require("express").Router();
    var router1 = require("express").Router();
    var bcrypt = require('bcrypt')
    var jwt = require('jsonwebtoken')

    //app.use(express.json())

    router.post("/signUp", async (req, res) => {
        try {
            if (req.body.Password === req.body.ConfirmPassword) {
                var salt = await bcrypt.genSalt()
                console.log(salt);
                var hashpass = await bcrypt.hash(req.body.Password, salt)


                console.log(req.body);
                var db = req.app.locals.db;
                var user = {
                    FirstName: req.body.FirstName,
                    LastName: req.body.LastName,
                    Gender: req.body.Gender,
                    Country: req.body.Country,
                    //store pass encrypted using bcrypt
                    Password: hashpass,
                    Email: req.body.Email.trim().toLowerCase(),
                    //confirm is not required to put in db
                    ConfirmPassword: hashpass,
                    Username: req.body.Username,
                    Status: req.body.Status,
                    Timestamp: Date.now(),
                    Follower: [],
                    Following: []

                };
            }
            if (req.body.Email) {
                if (user.Password === user.ConfirmPassword) {
                    const users = db.collection('User').insertOne(user).then(results => {
                        console.log(results)
                        res.send(results)
                    })
                        .catch(error => res.status(200).json({ error: "Please use unique email and username" }))
                }
                else {
                    res.status(200).json({ error: "both Password must be same" })
                }
            }
            else {
                res.status(200).json({ error: "Email is Required" })
            }


        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "error Please check password or username might be in use" || "Something went wrong" })

        }
    });
    router.post("/login", async (req, res) => {
        try {
            console.log(req.body);
            const db = req.app.locals.db;

            var userss = undefined;
            var Password = req.body.Password
            if (req.body.Email != undefined)
                var Email = req.body.Email.trim().toLowerCase()
            if (req.body.Username != undefined)
                var Username = req.body.Username.trim().toLowerCase()




            const users = await db.collection('User').findOne({ $or: [{ Email: Email }, { Username: Username }] }).then(results => {

                // res.status(500).json({ error: "No user found" })
                userss = results;
            })
                .catch(error => console.log(error))
            console.log(userss);
            var condition = await bcrypt.compareSync(req.body.Password, userss.Password);
            console.log(condition);
            if (condition) {
                // console.log(results)
                const accessToken = jwt.sign(userss, process.env.ACCESS_TOKEN_SECRET)
                res.send({ success: "login sucess", accessToken: accessToken })
            }
            else {
                res.status(500).json({ error: "Please enter correct password" })
            }


        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error || "Something went wrong" })

        }
    });

    function authenticateToken(req,res,next){
        const authHeader=req.headers['authorization']
        const token=authHeader && authHeader.split(' ')[1] 
        if(token==null) return status(401).json({ error:  "worng token" })

        jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,user) =>{
            if(err) return status(401).json({ error:  "not access" })
            req.user=user;
            console.log(user);
            next()
        })
    }
    router.post("/sendResetLink", async (req, res) => {
        try {

        } catch (error) {

        }

    })
    router.post("/password_resent/:userId", async (req, res) => {
        try {

        } catch (error) {

        }

    })

    router1.post("/createPost", async (req, res) => {
        try {
            console.log(req);
            const db = req.app.locals.db;
            var post = {
                PostedBy: req.body.PostedBy,
                PostTitle: req.body.PostTitle,
                Qoutes: req.body.Qoutes,
                Description: req.body.Description,
                Link: req.body.Link,
                Likes: req.body.Likes,
                //store pass encrypted using bcrypt
                Tag: [],

                Timestamp: Date.now(),
                LikedBy: [],
                Comment: []

            }

            const users = db.collection('Posts').insertOne(post).then(results => {
                console.log(results)
                res.send(results)
            })
                .catch(error => res.status(200).json({ error: "Something went wrong" }))

        } catch (error) {
            console.log(error);
            console.log(error);
        }

    })
    router1.get("/getPostForUser",authenticateToken, async (req, res) => {
        try {
            const db = req.app.locals.db;
            const users = db.collection('Posts').find({ PostedBy: req.user.Username }).toArray().then(results => {
                console.log(results)
                res.send(results)
            })
                .catch(error => res.status(200).json({ error: "Something went wrong" }))
        } catch (error) {

        }

    })
    router1.get("/getAllPost", async (req, res) => {
        try {
            const db = req.app.locals.db;
            const users = db.collection('Posts').find({}).toArray().then(results => {
                console.log(results)
                res.send(results)
            })
                .catch(error => res.status(200).json({ error: "Something went wrong" }))
        } catch (error) {
            console.log(error);
        }

    })
    router1.get("/getPostByTag", async (req, res) => {
        try {
            const db = req.app.locals.db;
            const users = db.collection('Posts').find({ Tag: { $in: [req.body.Tag] } }).toArray().then(results => {
                console.log(results)
                res.send(results)
            })
                .catch(error => res.status(200).json({ error: "Something went wrong" }))
        } catch (error) {

        }

    })
    router1.get("/getRecentPost", async (req, res) => {
        try {
            const db = req.app.locals.db;
            var indicator = 0;
            if (req.body.Username != undefined && req.body.Limit != undefined) {
                indicator = 1;
            }
            else if (req.body.Username === undefined && req.body.Limit != undefined) {
                indicator = 2
            }
            console.log(indicator);
            if (indicator === 2) {
                const users = db.collection('Posts').find({}).sort({ Timestamp: 1 }).limit(req.body.Limit).toArray().then(results => {
                    console.log(results)
                    res.send(results)
                })
                    .catch(error => res.status(200).json({ error: "Something went wrong" }))
            }
            else if (indicator === 1) {
                const users = db.collection('Posts').find({ PostedBy: req.body.Username }).sort({ Timestamp: 1 }).limit(req.body.Limit).toArray().then(results => {
                    console.log(results)
                    res.send(results)
                })
                    .catch(error => res.status(200).json({ error: "Something went wrong" }))
            }
            else {
                res.status(200).json({ error: "pass limit and/or username" })
            }
        } catch (error) {
            console.log(error);
        }

    })
    router1.post("/likePost", async (req, res) => {
        try {
            var flag = false;
            const db = req.app.locals.db;
            var Liker = {

                LikedBy: req.body.LikedBy,

                Timestamp: Date.now(),


            };
            if (req.body.LikedBy != undefined) {
                const users = db.collection('Posts').update({ _id: new ObjectId(req.body.id) }, { $inc: { Likes: 1 }, $push: { "LikedBy": Liker } }).then(results => {
                    console.log(results)
                    res.send(results)
                    flag = true;
                })
                    .catch(error => res.status(200).json({ error: "Something went wrong" }))
            }
            else {
                res.status(200).json({ error: "Something went wrong" })
            }

        } catch (error) {

        }

    })
    router1.post("/addCommentToPost", async (req, res) => {
        try {

        } catch (error) {

        }

    })
    router1.delete("/deletePost", async (req, res) => {
        try {

        } catch (error) {

        }

    })
    router1.patch("/editPost", async (req, res) => {
        try {

        } catch (error) {

        }

    })
    router.patch("/followUser", async (req, res) => {
        try {

        } catch (error) {

        }

    })
    router.patch("/unfollowUser", async (req, res) => {
        try {

        } catch (error) {

        }

    })

    //TODO : forget pass , create post with type and ocmment and like,

    app.use('/api', router);
    app.use('/api/post', router1);
}
const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');


const JWT_Secret = "HarryisGoodb$oy";

//ROUTE 1 : //Create a User using: POST "/api/auth/createuser". Doesn't require Auth,no login required
router.post(
  "/createuser",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid Email").isEmail(),
    body("password", "password must be atleast 5 character").isLength({
      min: 5,
    }),
  ],async (req, res) => {
    let success = false;

    //if there are errors ,return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success,errors: errors.array() });
    }

    try {
    //check whether the user with email exists already
      let user = await User.findOne({ email: req.body.email });
      // console.log(user);
      if (user) {
        return res
          .status(400)
          .json({ success,error: "Sorry a user with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      secPass =  await bcrypt.hash(req.body.password,salt);
      //create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass
      });

      //    .then(user => res.json(user))
      //    .catch(err=> {console.log(err)
      //    res.json({error:'Please enter a unique value for email',message: err.message})})

      const data={
        user:{
          id:user.id
        }
      }
      const authtoken = jwt.sign(data,JWT_Secret);
      // console.log(authtoken);
      success = true;
      res.json({success,authtoken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Some Error Occured");
    }
  }
);
//ROUTE 2://Authenticate a User using :POST "/api/auth/login".No login Required.
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body('password','Password Cannot be blank').exists(),
  ],async (req, res) => {

    let success = false;
     //if there are errors ,return bad request and the errors
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }

     const {email,password}= req.body;
     try{
      let user = await User.findOne({email});
      if(!user){
        success = false
        return res.status(400).json({error :"Please try to login with correct credentials"});
      }

      const passwordCompare = await bcrypt.compare(password,user.password);
      if(!passwordCompare){
        success = false
        return res.status(400).json({success,error :"Please try to login with correct credentials"});
      }
      const data={
        user:{
          id:user.id
        }
      }
      const authtoken = jwt.sign(data,JWT_Secret);
      success= true;
      res.json({success,authtoken});


     }catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }

  })

//ROUTE 3://GET loggin User details using :POST "/api/auth/getuser".Login Required.
router.post(
  "/getuser",fetchuser,async (req, res) => {
try{
  userId = req.user.id;
  const user = await User.findById(userId).select("-password")
  res.send(user);
}catch(error){
  console.error(error.message);
  res.status(500).send("Internal Server Error");
}
  })

module.exports = router;

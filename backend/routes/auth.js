const express=require('express');
var jwt = require('jsonwebtoken');
const User = require('../models/User');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
var fetchuser=require('../components/fetchuser')
const JWT_SECRET="KANISHK IS GOOD BOY";

//create a User
router.post('/createuser',[
    body('email','enter a valid email').isEmail(),
    body('password','enter a valid password').isLength({ min: 5 }),
    body('name','enter a valid name').isLength({ min: 5 })
],async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
   
    try{

    let user=await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({error:"sorry with the a email already exist"})
    }
         const salt=await bcrypt.genSalt(10);
         const secpas=await bcrypt.hash(req.body.password,salt)    
       user=await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secpas
      })
          
    const data= {
      user:{
        id:user.id
      }
    }
    const authtoken=jwt.sign(data,JWT_SECRET);
    console.log(authtoken);
    res.json({authtoken})
}catch(error){
    console.error(error.message)
    res.status(500).send("some error been occured");
}
})
router.post('/login',[
  body('email','enter a valid email').isEmail(),
  body('password','Password cannot be blank').exists()
],async(req,res)=>{
  const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

 const{email,password}=req.body;
 try {
     let user=await User.findOne({email});
     if(!user){
       return res.status(400).json({error:"please login with correct credentials"});
        }
        const comparepassword=await bcrypt.compare(password,user.password);
        if(!comparepassword){
          success=false;
       return res.status(400).json({success,error:"please login with correct credentials"});
        }
        const data={
          user:{
            id:user.id
          }
        }
        const authtoken=jwt.sign(data,JWT_SECRET);
        success=true;
        res.json({success,authtoken})
         
 } catch(error){
  console.error(error.message)
  res.status(500).send("internal error error been occured");
}
})
router.post('/getuser',fetchuser,async(req,res)=>{

  try {
    userId=req.user.id;
      const user=await User.findById(userId).select("--password");
      res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server issue")
  }

  })
module.exports=router;
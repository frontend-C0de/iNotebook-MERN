const express = require('express');
const User = require('../models/User');
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Fetchuser = require('../middleware/Fetchuser');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = 'Est@nocheL@vida$es%compliet@';
//Route 1:create a user using :POST "/api/auth/createuser". no login required
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
    }

    //check whether the user with this email exists aleready
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry a user with this email aleready exists" })
        }

        //bcrypt generate a hash string behalf of password secured for hacking purpose.
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);
        
        //create a new users
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        });

        //jwt token value return and convert in this data form.
        const data = {
            user: {
                id: user.id
            }
        }
        //Any user signup jwt return a token value for security purpose.
        const authtoken = jwt.sign(data, JWT_SECRET);
        //res.json(user)
        success = true;
        res.json({ success, authtoken })
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//Route 2:Authentication a User using: POST "/api/auth/login". No login requried. 
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank ').exists(),
], async (req, res) => {
    let success = false;
   // if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email, password} =req.body;
    try {
        let user = await User.findOne({email});
        if(!user){
            success = false
            return res.status(400).json({error:"Please try to login with correct credentials"});
        }

       const passwordCompare = await bcrypt.compare(password, user.password);
       if(!passwordCompare){
        success = false
        return res.status(400).json({success, error:"Please try to login with correct credentials"});
       }    
       const data = {
        user: {
            id: user.id
        }
    }
    const authtoken = jwt.sign(data, JWT_SECRET);  
    success = true;
    res.json({success, authtoken}) 

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

//Route 3:Get loggedin User using: POST "/api/auth/getuser".Login requried.
router.post('/getuser',Fetchuser, async (req, res) => {
try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
} catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
}
})


module.exports = router

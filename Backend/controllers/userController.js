import User from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = 'your_jwt_secret_here'
const TOKEN_EXPIRES = '24h'

// const createToken =  (userId) =>{
//     jwt.sign({id: userId},JWT_SECRET , { expiresIn : TOKEN_EXPIRES})
// }


// REGISTER A USER 

// export async function registerUser(req,res){
//     const {name, email,password} = req.body;
//     if(!name || !email || !password){
//         return res
//         .status(400)
//         .json({
//             success : false,
//             message : "All fields are requireds.!"
//         })
//     }
//     if(!validator.isEmail(email))
//     {
//         return res.status(400).json({
//             success : false,
//             message : "Invalid email"
//         })
//     }

//     if(password.length < 8){
//         return res.status(400).json({
//             success:false,
//             message:"Password Must be at least of 8 characters."
//         })
//     }

//     try {
//         if(await User.findOne({email})){
//             return res.status(409).json({
//                 success : false,
//                 message : 'User already Present '
//             })

//         }

//         const hashed = await bcrypt.hash(password, 10)
//         const user = await User.create({name,email,password:hashed})
//         const token = createToken(user._id);
//         res.status(200).json({
//             success : true,
//             token,
//             user: {id : user._id, name : user.name, email : user.email}
//         })
        
        
//     } 
//     catch (err) {
//         console.error(err)
//         res.status(500).json({
//             success : false,
//             message : 'server error'
//         })
        
//     }
// }

// REGISTER A USER 
export async function registerUser(req, res){
    const {name, email, password} = req.body;

    if(!name || !email || !password){
        return res.status(400).json({
            success: false,
            message: "All fields are required!"
        });
    }

    if(!validator.isEmail(email)){
        return res.status(400).json({
            success: false,
            message: "Invalid email"
        });
    }

    if(password.length < 8){
        return res.status(400).json({
            success: false,
            message: "Password must be at least 8 characters."
        });
    }

    try {
        // Check if user already exists
        if(await User.findOne({email})){
            return res.status(409).json({
                success: false,
                message: 'User already exists'
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashed});

        const token = createToken(user._id);   // ← Now it will generate properly

        res.status(201).json({
            success: true,
            token,                     // ← Token will now appear
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email 
            }
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
}



// tp login a user 

export async function loginUser(req,res){
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({
            success : false,
            message : "Both Fields are required..!"
        });

    }
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success : false,
                message : "Invalid email or Password"
            });
        }

        const match = await bcrypt.compare(password, user.password);
        if(!match) {
            return res.status(400).json({
                success : false,
                message : "Invalid email or Password"
            });

        }

        const token = createToken(user._id);
        res.json({
            success : true,
            token,
            user : {
                id : user._id,
                name : user.name,
                email : user.email
            }
        });
        
    } 
    catch (err) {
        console.error(err)
        res.status(500).json({
            success : false,
            message : 'server error'
        })
        
    }
}



// to get  login user details 

export async function getCurrentUser(req, res){
    try {
        // const user = await User.findById(req.user.id).select('name email');
        const user = await User.findById(req.user._id).select('name email');

        if(!user){
            return res.status(404).json({
                success : false,
                message : "User Not found"
            });
        }

        res.json({success : true , user})
        
    }
     catch (err) {
        console.error(err)
        res.status(500).json({
            success : false,
            message : 'server error'
        })
        
    }
}


// to update a user profile 

// export async function updateProfile(req,res){
//     const{name , email } = req.body;
//     if(!name || !email || !validator.isEmail(email)){
//         return res.status(400).json({
//             success : false,
//             message : "Vaild email and name are REQUIRED!"
//         })
//     }


//     try {
//         const exists = await User.findOne({email, _id:{$ne : req.user.id}});
//         if(exists){
//             return res.status(409).json({
//                 success : false ,
//                 message : 'Email already in USE!'
//             })
//         }
//         const user = await User.findByIdAndUpdate(
//              req.user.id,
//             {name , email},
//             {new : true, runValidators : true, select : "name email"}

//         );

//         res.json({
//             success : true ,
//             user
//         }) 
//     } 
//     catch (err) {
//         console.error(err)
//         res.status(500).json({
//             success : false,
//             message : 'server error'
//         })
        
//     }

// }

// ================== UPDATE PROFILE ==================
export async function updateProfile(req, res) {
    const { name, email } = req.body;

    // Basic validation
    if (!name || !email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Valid name and email are required!"
        });
    }

    try {
        // Check if the new email is already taken by another user
        const emailExists = await User.findOne({ 
            email, 
            // _id: { $ne: req.user.id } 
            _id: { $ne: req.user._id }

        });

        if (emailExists) {
            return res.status(409).json({
                success: false,
                message: 'This email is already in use by another user!'
            });
        }

        // Update the user
        const updatedUser = await User.findByIdAndUpdate(
            // req.user.id,
            req.user._id,

            { name, email },
            { new: true, runValidators: true }
        ).select("name email");

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } 
    catch (err) {
        console.error("Update Profile Error:", err);
        res.status(500).json({
            success: false,
            message: 'Server error while updating profile'
        });
    }
}


// to chaneg user password 
export async function updatePassword(req, res){
    const {currentPassword , newPassword} = req.body;
    if(!currentPassword || !newPassword || newPassword.length < 8){
        return res.status(400).json({
            success : false,
            message : "password invalid or too short!"
        })
    }
    try {
        // const user = await User.findById(req.user.id).select("password");
        const user = await User.findById(req.user._id).select("password");


        if(!user){
            return res.status(404).json({
                success : false ,
                message : "User not found!"

            })
        }
        const match = await bcrypt.compare(currentPassword, user.password)
        if(!match){
            return res.status(401).json({
                success : false,
                message : "Current Password is INCORRECT!"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();
        res.json({
            success : true,
            message : "Password CHANGED."
        })

    }
     catch (err) {
        console.error(err)
        res.status(500).json({
            success : false,
            message : 'server error'
        })
        
    }
}



const createToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });
};
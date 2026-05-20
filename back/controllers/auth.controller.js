import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";






const generateToken = ( userId ) => {

  const accessToken = jwt.sign( { userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  } );


  const refreshToken = jwt.sign( { userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  } );
  return { accessToken, refreshToken };

};

const storeRefeshToken = async ( userId, refreshToken ) => {
  await redis.set( `refresh_token:${ userId }`, refreshToken, {
    EX: 7 * 24 * 60 * 60,
  } );
};

const setCookies = ( res, accessToken, refreshToken ) => {
  res.cookie( "accessToken", accessToken, {
    httpOnly: true, // prevent xss attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents csrf attack, cross-site request forgery
    maxAge: 15 * 60 * 1000, // 15 minutes
  } );
  res.cookie( "refreshToken", refreshToken, {
    httpOnly: true, // prevent xss attacks, cross site scripting attack
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // prevents csrf attack, cross-site request forgery
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  } );
};



export const signup = async ( req, res ) => {
  try {
    // destructure
    const { email, password, name } = req.body;

    // check if email is already exist
    const userExist = await User.findOne( { email } );
    if ( userExist ) {
      return res.status( 400 ).json( { message: "User already exists" } );
    }

    // create email
    const user = await User.create( { name, email, password } );


    // authentication
    const { accessToken, refreshToken } = generateToken( user._id );
    await storeRefeshToken( user._id, refreshToken );


    setCookies( res, accessToken, refreshToken );

    // send response successfull
    res.status( 201 ).json( {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }, message: "User created successfully"
    } );

  } catch ( error ) {
    res.status( 500 ).json( { message: error.message } );
  }
};


export const login = async ( req, res ) => {
  res.send( "sign up route called" );
};
export const logout = async ( req, res ) => {
  res.send( "sign up route called" );
};

// import User from "../models/user.model.js";
// import jwt from "jsonwebtoken";
// // 1. استيراد كائن الـ redis اللي جهزناه في ملف الـ lib
// import { redis } from "../lib/redis.js";

// export const signup = async ( req, res ) => {
//   try {
//     // destructure
//     const { email, password, name } = req.body;

//     // check if email is already exist
//     const userExist = await User.findOne( { email } );
//     if ( userExist ) {
//       return res.status( 400 ).json( { message: "User already exists" } );
//     }

//     // create user
//     const user = await User.create( { name, email, password } );

//     // 🔒 [Authentication]: توليد الـ JWT Token
//     const token = jwt.sign(
//       { userId: user._id },
//       process.env.JWT_SECRET || "fallback_secret_key",
//       { expiresIn: "7d" } // مدة صلاحية التوكن أسبوع مثلاً
//     );

//     // ⚡ [Redis]: حفظ جلسة المستخدم في الـ RAM
//     // هنخزن الـ Token كمفتاح، وقيمته الـ userId، وينتهي صلاحيته تلقائياً بعد 7 أيام (بالثواني: 7 * 24 * 60 * 60)
//     const redisKey = `session:${ token }`;
//     await redis.set( redisKey, user._id.toString(), { ex: 7 * 24 * 60 * 60 } );

//     // إخفاء الباسورد من الـ Response لأمان البيانات
//     user.password = undefined;

//     // send response successful ومحملة بالتوكن
//     res.status( 201 ).json( {
//       success: true,
//       user,
//       token, // الفرونت إند هيحتفظ بالتوكن ده ويبعته في الـ Headers مع كل طلب
//       message: "User created successfully"
//     } );

//   } catch ( error ) {
//     res.status( 500 ).json( { message: error.message } );
//   }
// };




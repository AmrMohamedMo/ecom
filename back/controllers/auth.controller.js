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

// const storeRefeshToken = async ( userId, refreshToken ) => {
//   await redis.set( `refresh_token:${ userId }`, refreshToken, {
//     EX: 7 * 24 * 60 * 60,
//   } );
// };

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



// export const signup = async ( req, res ) => {
//   try {
//     // destructure
//     const { email, password, name } = req.body;

//     // check if email is already exist
//     const userExist = await User.findOne( { email } );
//     if ( userExist ) {
//       return res.status( 400 ).json( { message: "User already exists" } );
//     }

//     // create email
//     const user = await User.create( { name, email, password } );


//     // authentication
//     const { accessToken, refreshToken } = generateToken( user._id );
//     await storeRefeshToken( user._id, refreshToken );


//     setCookies( res, accessToken, refreshToken );

//     // send response successfull
//     res.status( 201 ).json( {
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }, message: "User created successfully"
//     } );

//   } catch ( error ) {
//     res.status( 500 ).json( { message: error.message } );
//   }
// };


export const login = async ( req, res ) => {
  res.send( "sign up route called" );
};
export const logout = async ( req, res ) => {
  res.send( "sign up route called" );
};




// ----------- Redis -------------------- //

// await redis.set( "greeting", "hello World" );

// const message = await redis.get( "greeting" );
// console.log( message );

// await redis.del( "greeting" );




// await redis.set( "verification_code", "5592", { ex: 10 } );

// const code1 = await redis.get( "verification_code" );

// setTimeout(async () => {
//   const code2 = await redis.get( "verification_code" );
//   console.log("verification_code 3")
// }, 3000 );




// هنخزن كلمة سر مؤقتة (OTP) ونقول للـ Redis امسحيها بعد 10 ثواني بس!
// await redis.set( "verification_code", "5592", { ex: 10 } );


// // لو قريتها حالا:
// const code1 = await redis.get( "verification_code" );
// console.log( "كود التحقق دلوقتي:", code1 ); // هيطبع: 5592

// // طب تعال نخليه يستنى 11 ثانية وبعدين يقراها تاني؟
// setTimeout( async () => {
//   const code2 = await redis.get( "verification_code" );
//   console.log( "كود التحقق بعد 11 ثانية:", code2 ); // هيطبع: null (بخرت!)
// }, 2000 );




// async function testObject () {
//   try {
//     // create object
//     const userProfile = {
//       name: "AA",
//       email: "aa@a.com",
//       role: "Dev"
//     };

//     // transform and save
//     await redis.set( "user:101:profile", JSON.stringify( userProfile ) );
//     console.log( `successful save object user in cache 1` );

//     // read data from redis
//     const cachedString = await redis.get( "user:101:profile" );
//     console.log( `before extract redis string return 2` );

//     // old redis
//     // const parseData = JSON.parse( cachedString );
//     const parseData = cachedString
//     console.log( `username after parse`, parseData.name );
//     console.log( `user role`, parseData.role );

//   } catch ( error ) {
//     console.error( "error", error );
//   }
// }



// testObject();


// refresh token saved in redis for authentication
// for data that saved in cookies
// save in redis for the first time
// send ( userId, refreshToken ) as a params
// لية بنسجل دي بس ف ال redis
// عشان دي ال بنروع لل redis من cookies بيها
// و عشان التانية بتموت
// create refresh token
const storeRefreshToken = async ( userId, refreshToken ) => {
  // after 15 dies --- key , value , exDate
  await redis.set(
    `refresh_token:${ userId }`, refreshToken,
    { ex: 7 * 24 * 60 * 60 }
  );
};



const signup = async ( req, res ) => {
  try {
    const { email, password, name } = req.body;
    const user = await User.create( { email, password, name } );

    // 1-create
    // generateTokens
    const accessToken = jwt.sign( { userId: user._id }, process.env.ACCESS_TOKEN_SECRET );
    const refreshToken = jwt.sign( { userId: user._id }, process.env.REFRESH_TOKEN_SECRET );

    // 2- send

    // A- redis
    await storeRefreshToken( user._id, refreshToken );

    // B- cookies
    res.cookies( "accessToken", accessToken,
      { httpOnly: true, secure: true }
    );
    res.cookies( "refreshToken", refreshToken,
      { httpOnly: true, secure: true }
    );

    res.status( 201 ).json( { message: "successfully signup 🎉", user } );

  } catch ( error ) {
    res.status( 500 ).json( { message: error.message } );
  }
};
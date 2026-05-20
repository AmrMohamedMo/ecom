// import Redis from "ioredis";
// import dotenv from "dotenv";

// dotenv.config();

// const redisUrl = process.env.UPSTASH_REDIS_URL;
// if ( !redisUrl ) {
//   throw new Error( "Missing UPSTASH_REDIS_URL environment variable" );
// }

// // export const redis = new Redis( redisUrl, {
// //   connectTimeout: 10000,
// //   maxRetriesPerRequest: 1,
// //   retryStrategy: ( times ) => {
// //     if ( times >= 1 ) return null;
// //     return 1000;
// //   },
// // } );

// export const redis = new Redis( redisUrl, {
//   connectTimeout: 15000, // زيادة وقت محاولة الاتصال لـ 15 ثانية
//   maxRetriesPerRequest: null, // ioredis توصي بوضعها null عند استخدام استراتيجية إعادة محاولة مخصصة
//   retryStrategy: ( times ) => {
//     // يعيد المحاولة كل 2 ثانية، بحد أقصى 5 مرات، وبعدها يوقف تماماً عشان ميعلقش السيرفر
//     if ( times > 5 ) {
//       console.error( "❌ Redis reached max retry attempts. Stopping." );
//       return null;
//     }
//     return 2000;
//   },
// } );

// redis.on( "error", ( err ) => {
//   console.error( "Redis connection error:", err );
// } );
// redis.on( "connect", () => {
//   console.log( "Redis connected" );
// } );
// redis.on( "ready", () => {
//   console.log( "Redis ready" );
// } );
// redis.on( "close", () => {
//   console.log( "Redis connection closed" );
// } );

// export async function connectRedis () {
//   try {
//     await redis.ping();
//     console.log( "Redis ping successful" );
//   } catch ( err ) {
//     console.error( "Redis failed to connect:", err );
//     throw err;
//   }
// }

// ظظ UPSTASH_REDIS_URL = rediss://default:gQAAAAAAAf1-AAIgcDFiNjA5MmJhYmQzZDE0NDI2OTFiYTU3ZTU1ZmU1YTM2Yg@supreme-bluejay-130430.upstash.io:6379



import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

// Upstash بتديك رابط للـ REST ورابط للـ TOKEN في الـ Dashboard بتاعتهم
// تأكد إنك حطيتهم في الـ .env
const redis = new Redis( {
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
} );

export { redis };

// دالة فحص الاتصال البديلة
export async function connectRedis () {
  try {
    await redis.ping();
    console.log( "🚀 Upstash Redis (HTTP REST) connected successfully!" );
  } catch ( err ) {
    console.error( "❌ Redis failed to connect via HTTP:", err );
    throw err;
  }
}
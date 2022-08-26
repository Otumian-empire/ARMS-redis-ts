import dotenv from "dotenv";
dotenv.config();

export const rounds:number = parseInt(process.env.SALT_ROUNDS) || 10;
export const JWT_SECRET:string = process.env.JWT_SECRET;
export const port:number = parseInt(process.env.PORT) || 3000;
export const MINIMUM_PASSWORD_SIZE:number = 6;
export const ONE:number = 1;
// set to one week if the JWT_TTL is not set. This is is microseconds
export const JWT_TTL:number = parseInt(process.env.JWT_TTL) || 1000 * 60 * 60 * 24 * 7;
export const PAGINATION:any = { page: 1, pageSize: 12 };
export const REDIS_URI:string = process.env.REDIS_URI;
// set to one hour if the REDIS_TTL is not set. This is in seconds
export const REDIS_TTL:number = parseInt(process.env.REDIS_TTL) || 60 * 60;

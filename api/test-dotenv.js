import dotenv from 'dotenv';
const result = dotenv.config();
console.log('Dotenv loaded:', result);
console.log('PORT:', process.env.PORT);

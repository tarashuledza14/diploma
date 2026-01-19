
export const jwtConstants = {
  secret: process.env.JWT_SECRET,
  expiresIn: parseInt(process.env.JWT_EXPIRES_IN),
};

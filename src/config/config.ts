import 'dotenv/config'

export default {
    accessKey: process.env.ACCESS_TOKEN_SECRET_KEY ?? 'nguyenthanhnghi1421', 
    refreshKey: process.env.REFRESH_TOKEN_SECRET_KEY ?? '1241ihgnhnahtneyugn', 
    deviceTokenKey: process.env.DEVICE_TOKEN_SECRET_KEY ?? 'T38/3dr38*32332323dggg', 
    expiryAccessToken: process.env.EXPIRY_ACCESS_TOKEN,
    expiryRefreshToken: process.env.EXPIRY_REFRESH_TOKEN,
    expiryRefreshTokenCookie: process.env.EXPIRY_REFRESH_TOKEN_COOKIE ?? '604800000',
    port: process.env.PORT,
    defaultPassword: process.env.DEFAULT_PASSWORD ?? '123123123',
    email: process.env.EMAIL,
    emailPassword: process.env.EMAIL_PASSWORD
}
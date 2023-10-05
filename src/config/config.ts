import 'dotenv/config'

export default {
    accessKey: process.env.ACCESS_TOKEN_SECRET_KEY ?? 'nguyenthanhnghi1421', 
    refreshKey: process.env.REFRESH_TOKEN_SECRET_KEY ?? '1241ihgnhnahtneyugn', 
    expiryAccessToken: process.env.EXPIRY_ACCESS_TOKEN,
    expiryRefreshToken: process.env.EXPIRY_REFRESH_TOKEN
}
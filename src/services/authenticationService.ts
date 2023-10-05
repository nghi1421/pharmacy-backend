import { User } from '../entity/User'
import { AppDataSource } from '../dataSource'
import { Repository } from 'typeorm'
import jwt from 'jsonwebtoken'
import config from '../config/config'

const userRepository: Repository<User> = AppDataSource.getRepository(User)

const login = async (username: string, password: string) => {
    try {
        const user = await userRepository.findOne({ where: { username: username } })
        if (user && user.checkPassword(password)) {
            const accessToken = jwt.sign({
                id: user.id,
                role: user.role,
            }, config.accessKey, { expiresIn: config.expiryAccessToken });
            const refreshToken = jwt.sign({
                id: user.id,
                role: user.role,
            }, config.accessKey, { expiresIn: config.expiryRefreshToken });

            return {
                messge: 'Login successes.',
                data: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        }
        return {
            errorMessage: 'Login failed. Wrong username or password.'
        }
    } catch (error: unknown) {
        return {
            errorMessage: error
        }
    }
}

export default{
    login
}
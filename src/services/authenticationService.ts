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

            const token = jwt.sign({
                id: user.id,
                role: user.role,
            }, config.jwtSecret, { expiresIn: 60 * 60 * 24 * 7 });
            return {
                messge: 'Login successes.',
                data: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                token
            }
        }
        return {
            errorMessage: 'Login failed, wrong username or password.'
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
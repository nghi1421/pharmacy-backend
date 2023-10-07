import { User } from '../entity/User'
import { AppDataSource } from '../dataSource'
import { Repository } from 'typeorm'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import { LoginResponse } from '../global/interfaces/LoginResponse'
import { Staff } from '../entity/Staff'

const userRepository: Repository<User> = AppDataSource.getRepository(User)
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff)

const login = async (username: string, password: string): Promise<LoginResponse> => {
    return new Promise(async (resolve, reject) => {
        const user = await userRepository.findOneBy({ username: username })
        if (user !== null && user.checkPassword(password)) {
            const staff = await staffRepository.find({where: { user: { id: user.id }}});
            if (staff.length == 0) {
                reject({errorMessage: 'Account does not match staff information.'})
                return
            }
            const accessToken = jwt.sign({
                userId: user.id,
                role: user.role,
                staffId: staff[0].id
            }, config.accessKey, { expiresIn: config.expiryAccessToken });
            const refreshToken = jwt.sign({
                userId: user.id,
                role: user.role,
                staffId: staff[0].id
            }, config.accessKey, { expiresIn: config.expiryRefreshToken });

            resolve({
                message: 'Login successes.',
                data: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                },
                accessToken,
                refreshToken
            })
        }
        else {
            reject({
                errorMessage: 'Login failed. Wrong username or password.'
            })
        }
    })
}

export default{
    login
}
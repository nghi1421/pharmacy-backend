import { User } from '../entity/User'
import { AppDataSource } from '../dataSource'
import { Repository } from 'typeorm'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import { LoginResponse } from '../global/interfaces/LoginResponse'
import { Staff } from '../entity/Staff'
import { DataOptionResponse } from '../global/interfaces/DataOptionResponse'
import { validateOrReject } from 'class-validator'

const userRepository: Repository<User> = AppDataSource.getRepository(User)
const staffRepository: Repository<Staff> = AppDataSource.getRepository(Staff)

const login = async (username: string, password: string): Promise<LoginResponse> => {
    return new Promise(async (resolve, reject) => {
        const user: User|null = await userRepository.findOneBy({ username: username })
        if (user !== null && user.checkPassword(password)) {
            const staff: Staff|null = await staffRepository.findOneBy({ user: { id: user.id }});
            if (!staff) {
                reject({errorMessage: 'Account does not match staff information.'})
                return
            }
            console.log(user);
            console.log(staff);
            const accessToken = jwt.sign({
                userId: user.id,
                roleId: user.role.id,
                staffId: staff.id
            }, config.accessKey, { expiresIn: config.expiryAccessToken });
            const refreshToken = jwt.sign({
                userId: user.id,
                roleId: user.role.id,
                staffId: staff.id
            }, config.refreshKey, { expiresIn: config.expiryRefreshToken });

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

const changePassword =
    (username: string, newPassword: string, oldPassword: string): Promise<DataOptionResponse<User>> => {
    return new Promise(async (resolve, reject) => {
        try {
            const user: User | null = await userRepository.findOneBy({ username: username });
            
            if (!user) {
                reject({ errorMessage: 'User not found.' });
            } else {
                if (user.checkPassword(oldPassword)) {
                    user.password = newPassword;
                    user.hashPasswrod();

                    await validateOrReject(user);
                    await userRepository.save(user);

                    resolve({
                        message: 'Password changed successfully.',
                        data: user,
                    })
                }
                else {
                    reject({ errorMessage: 'Wrong password.' });
                }
            }
        } catch (error) {
            reject({errorMessage: error})
        }
    })
}

export default{
    login,
    changePassword
}
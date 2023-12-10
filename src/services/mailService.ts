import nodemailer from 'nodemailer'
import config from '../config/config';

const sendOtp = (receiver: string, otp: string) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email,
            pass: config.emailPassword
        }
    });

    let mailOptions = {
        from: config.email,
        to: receiver,
        subject: 'Xác thực tài khoản ON Pharmacy',
        html: `<p>Mã thực tài khoản của bạn là ${otp}</p>`,
    };  

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
}

const sendAccount = (receiver: string, username: string, password: string) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email,
            pass: config.emailPassword
        }
    });

    let mailOptions = {
        from: config.email,
        to: receiver,
        subject: 'Thông tin tài khoản ON Pharmacy',
        html: `<div><h3>Thông tin tài khoản, vui lòng đăng nhập và đổi mật khẩu để bảo mật thông tin.</h3></div>
            <div><p>Tên đăng nhập: ${username}</p></div>
            <div><p>Mật khẩu: ${password}</p></div>
        `,
    };  

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
}


export default {
    sendOtp,
    sendAccount
}
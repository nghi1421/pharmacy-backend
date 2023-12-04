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



export default {
    sendOtp
}
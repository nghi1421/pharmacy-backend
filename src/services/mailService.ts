import nodemailer from 'nodemailer'
import config from '../config/config';
import dayjs from 'dayjs';
import { formatNumber } from '../utils/format';

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

const sendNotification = (receiver: string, tableData: any[]) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email,
            pass: config.emailPassword
        }
    });

    const tableHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            table {
                border-collapse: collapse;
                width: 100%;
            }
            th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            }
            th {
            background-color: #f2f2f2;
            }
        </style>
        </head>
        <body>
        <h3>Thông báo thu hồi thuốc</h3>
        <p>Hệ thống cửa hàng nhận được thông báo từ công ti dược sản xuất và cung cấp thuốc lô thuốc mà khách hàng đã mua
        nằm trong là lô thuốc lỗi. Quý khách vui lòng không sử dụng thuốc dưới mọi hình thức và hoàn trả thuốc (kèm theo hóa đơn mua
            thuốc) để được hoàn tiền danh mục thuốc lỗi. Nếu quý khách đã sử dụng thuốc vui lòng theo dõi sức khỏe trong 24 giờ tới, nếu có bất
            cứ biểu hiện bất thường quý khách vui lòng đến trung tâm y tế gần nhất để theo dõi sức khỏe. Xin cảm ơn quý khác.
        </p>
        <div><h4>Danh sách đơn thuốc đã mua</h4></div>
        <table>
            <tr>
                <th>Mã đơn hàng</th>
                <th>Thời gian mua hàng</th>
                <th>Số lượng mua</th>
                <th>Số lượng trả</th>
            </tr>
            ${tableData.map(data => `
            <tr>
                <td>${data.exportId}</td>
                <td>${dayjs(data.exportDate).format('DD/MM/YYYY HH:mm:ss')}</td>
                <td>${formatNumber(data.quantity)}</td>
                <td>${data.quantityBack ? formatNumber(data.quantityBack) : 0}</td>
            </tr>
            `).join('')}
        </table>
        </body>
        </html>
        `;

    let mailOptions = {
        from: config.email,
        to: receiver,
        subject: '[KHẨN] Thông báo thu hồi thuốc ON Pharmacy',
        html: tableHTML,
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
    sendNotification,
    sendOtp,
    sendAccount
}
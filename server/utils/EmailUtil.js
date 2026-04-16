const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

// Cấu hình SMTP tường minh cho Gmail (thay vì dùng service: 'gmail')
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: MyConstants.EMAIL_USER,
    pass: MyConstants.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Cho phép self-signed cert trong dev
  },
});

const EmailUtil = {
  send(email, id, token) {
    const subject = 'Trầm Tịnh | Kích hoạt tài khoản';
    const text =
      'Cảm ơn bạn đã đăng ký tài khoản tại Trầm Tịnh!\n\n' +
      'Vui lòng sử dụng thông tin bên dưới để kích hoạt tài khoản tại trang: http://localhost:3000/active\n\n' +
      '  - ID: ' + id + '\n' +
      '  - Token: ' + token + '\n\n' +
      'Trân trọng,\nĐội ngũ Trầm Tịnh';

    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: `"Trầm Tịnh Store" <${MyConstants.EMAIL_USER}>`,
        to: email,
        subject: subject,
        text: text,
      };

      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.error('[EmailUtil] sendMail error:', err.message);
          reject(err);
        } else {
          console.log('[EmailUtil] Email sent to:', email, '| messageId:', result.messageId);
          resolve(true);
        }
      });
    });
  },

  // Kiểm tra kết nối SMTP (gọi khi server khởi động)
  verify() {
    return transporter.verify()
      .then(() => console.log('[EmailUtil] SMTP connection OK'))
      .catch(err => console.warn('[EmailUtil] SMTP connection FAILED:', err.message));
  }
};

module.exports = EmailUtil;

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
): Promise<void> {
  await transporter.sendMail({
    from: `"ATOS Destek" <${process.env.SMTP_USER}>`,
    to,
    subject: "Şifre Sıfırlama Talebi",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:2rem;text-align:center;">
          <h1 style="color:white;margin:0;font-size:1.8rem;">🔒 Şifre Sıfırlama</h1>
        </div>
        <div style="padding:2rem;background:white;">
          <p style="font-size:1rem;color:#2d3748;">Merhaba,</p>
          <p style="color:#4a5568;">ATOS hesabınız için bir şifre sıfırlama talebinde bulunuldu. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align:center;margin:2rem 0;">
            <a href="${resetUrl}" style="display:inline-block;padding:0.9rem 2rem;background:linear-gradient(135deg,#667eea,#764ba2);color:white;text-decoration:none;border-radius:10px;font-weight:600;font-size:1rem;">
              Şifremi Sıfırla
            </a>
          </div>
          <p style="color:#718096;font-size:0.9rem;">Bu bağlantı <strong>1 saat</strong> içinde geçerliliğini yitirecektir.</p>
          <p style="color:#718096;font-size:0.9rem;">Eğer bu talebi siz yapmadıysanız bu e-postayı görmezden gelebilirsiniz. Hesabınız güvende.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:1.5rem 0;" />
          <p style="color:#a0aec0;font-size:0.8rem;text-align:center;">ATOS · Afet Takip ve Operasyon Sistemi</p>
        </div>
      </div>
    `,
  });
}

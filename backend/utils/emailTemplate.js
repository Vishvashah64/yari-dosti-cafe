const getForgotPasswordTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #ea580c; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Yari Dosti Cafe</h1>
      </div>
      
      <div style="padding: 40px 20px; text-align: center;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
        <p style="color: #6b7280; font-size: 16px; margin-bottom: 30px;">
          We received a request to reset your password. Use the code below to verify your identity.
        </p>
        
        <div style="background-color: #fff7ed; padding: 20px; border-radius: 12px; display: inline-block; margin-bottom: 30px; border: 2px dashed #ea580c;">
          <span style="font-size: 32px; font-weight: bold; color: #ea580c; letter-spacing: 5px;">${otp}</span>
        </div>
        
        <div>
          <a href="https://yaridosti-cafe.onrender.com/forgot-password" style="background-color: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Go to Reset Page
          </a>
        </div>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>If you didn't request this, please ignore this email.</p>
        <p>&copy; ${new Date().getFullYear()} Yari Dosti Cafe. All rights reserved.</p>
      </div>
    </div>
  `;
};


const getVerificationTemplate = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 20px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #ea580c; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Yari Dosti Cafe</h1>
      </div>
      
      <div style="padding: 40px 20px; text-align: center;">
        <h2 style="color: #1f2937; margin-bottom: 20px;">Confirm Your Order</h2>
        <p style="color: #6b7280; font-size: 16px; margin-bottom: 30px;">
          Thank you for choosing Yari Dosti! Please use the code below to verify your Cash on Delivery (COD) order.
        </p>
        
        <div style="background-color: #fff7ed; padding: 20px; border-radius: 12px; display: inline-block; margin-bottom: 30px; border: 2px dashed #ea580c;">
          <span style="font-size: 32px; font-weight: bold; color: #ea580c; letter-spacing: 5px;">${otp}</span>
        </div>
        
        <div>
          <a href="https://yaridosti-cafe.onrender.com/profile" style="background-color: #ea580c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Return to Profile
          </a>
        </div>
      </div>
      
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
        <p>This code expires in 10 minutes.</p>
        <p>&copy; ${new Date().getFullYear()} Yari Dosti Cafe. All rights reserved.</p>
      </div>
    </div>
  `;
};

module.exports = { getForgotPasswordTemplate, getVerificationTemplate };
interface NotificationEmailData {
    name: string;
    product: string;
    policy: string;
    expiryDate: string;
    message: string;
}

export const notificationEmailTemplate = ({ name, product, policy, expiryDate, message }: NotificationEmailData) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Policy Expiry Reminder</title>
        <style>
            body {
                font-family: "Arial, sans-serif";
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #fff;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            }
            .header {
                background-color: #00C979;
                color: white;
                text-align: center;
                padding: 30px 20px;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                text-align: center;
                color: #333;
            }
            .message {
                font-size: 16px;
                line-height: 1.6;
                margin-top: 10px;
            }
            .footer {
                font-size: 14px;
                text-align: center;
                margin-top: 40px;
                color: #888;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Policy Expiry Reminder</h1>
            </div>
            <div class="content">
                <p class="message">
                    Dear ${name},<br><br>
                    Your policy <b>${policy}</b> under the product <b>${product}</b> is set to expire on <b>${expiryDate}</b>.<br><br>
                    <b>Message:</b> ${message}<br><br>
                    Please renew your policy to avoid any service interruptions.<br><br>
                    Thank you for your cooperation.
                </p>
                <p class="footer">
                    MaticUI Team
                </p>
            </div>
        </div>
    </body>
    </html>`;
};

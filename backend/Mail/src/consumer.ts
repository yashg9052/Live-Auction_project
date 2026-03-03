import ampq from "amqplib";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

let channel: ampq.Channel;
export const startSendOtpConsumer = async () => {
  try {
    const connection = await ampq.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: 5672,
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
    });

    channel = await connection.createChannel();
    const queuename = "auction-send-otp";
    await channel.assertQueue(queuename, { durable: true });

    console.log("✅Mail service started for otp emails");
    channel.consume(queuename, async (msg) => {
      if (msg) {
        try {
          const { to, subject, body } = JSON.parse(msg.content.toString());
          console.log(subject,body)
          const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            auth: {
              user: process.env.USER,
              pass: process.env.PASSWORD,
            },
          });
          await transporter.sendMail({
            from: "Chat-app",
            to,
            subject,
            text: body,
          });
          console.log(`OTP sent to mail ${to}`);
          channel.ack(msg);
        } catch (error) {
          console.log("Failed to send otp", error);
        }
      }
    });
  } catch (error) {
    console.log("Failed to connect to rabbitmq", error);
  }
};

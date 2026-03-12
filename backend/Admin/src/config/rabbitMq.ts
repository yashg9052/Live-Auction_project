import ampq from "amqplib";

export let channel: ampq.Channel;
export const connectRabbitMq = async () => {
  try {
    const connection = await ampq.connect({
      protocol: "amqp",
      hostname: process.env.Rabbitmq_Host,
      port: 5672,
      username: process.env.Rabbitmq_Username,
      password: process.env.Rabbitmq_Password,
    });

    channel = await connection.createChannel();
    console.log("✅Conneceted to rabbitmq");
    console.log("Bid Queue has started");
  } catch (error) {
    console.log("Failed to connect to rabbitmq", error);
  }
};

export const publishToQueue = async (queuename: string, message: any) => {
  if (!channel) {
    console.log("Rabbitmq channel is not initialized");
    return;
  }
  await channel.assertQueue(queuename, { durable: true });
  channel.sendToQueue(queuename, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};
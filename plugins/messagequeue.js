'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.decorate('sendMessage', function (message) {
    const body = message.toString()

    const { ServiceBusClient } = require("@azure/service-bus");

    const connectionString = process.env.AZURE_SERVICEBUS_CONNECTION_STRING
    const queueName = process.env.AZURE_SERVICEBUS_QUEUE

    if (!connectionString || !queueName) {
      console.log('Azure Service Bus connection string or queue name not defined. Exiting.')
      return
    }

    async function sendMessage() {
      const sbClient = new ServiceBusClient(connectionString);
      const sender = sbClient.createSender(queueName);

      try {
        console.log(`Sending message "${body}" to queue "${queueName}"`);
        await sender.sendMessages({ body: body });
      } catch (err) {
        console.error('Error sending message to Azure Service Bus:', err);
      } finally {
        await sender.close();
        await sbClient.close();
      }
    }

    sendMessage().catch(console.error);
  })
})

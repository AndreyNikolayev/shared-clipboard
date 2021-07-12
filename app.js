require('dotenv').config({path: './settings.env'});
const lockfile = require('proper-lockfile');

const { ServiceBusClient, ServiceBusAdministrationClient } = require("@azure/service-bus"); 
const listener = require("./listener");
const crypto = require("./crypto");

async function main() {

  try
  {
    await lockfile.lock('.lock');
    console.log('Await file is locked');
  }
  catch (e)
  {
    console.log(e);
    console.log('Await file cannot be locked.')
    return;
  }
  
  var receiverQueueName = process.argv[2] || process.env.QUEUE_NAME;
  var senderQueueName = receiverQueueName;

  if(receiverQueueName.endsWith('_Workspace')) {
    senderQueueName = receiverQueueName.replace('_Workspace', '');
  } else {
    senderQueueName = receiverQueueName + '_Workspace';
  }

  const adminClient = new ServiceBusAdministrationClient(process.env.SERVICE_BUS_CONNECTION_STRING);

  if(!await adminClient.queueExists(receiverQueueName)) {
    await adminClient.createQueue(receiverQueueName, {defaultMessageTimeToLive: 'PT1M'});
  }
  if(!await adminClient.queueExists(senderQueueName)) {
    await adminClient.createQueue(senderQueueName, {defaultMessageTimeToLive: 'PT1M'});
  }

  const sbClient = new ServiceBusClient(process.env.SERVICE_BUS_CONNECTION_STRING); 
  const sender = sbClient.createSender(senderQueueName);
  const receiver = sbClient.createReceiver(receiverQueueName, {receiveMode:'receiveAndDelete'});
    
  receiver.subscribe({
    processMessage: async (message) => {
      var decryptedText = crypto.decrypt(message.body);
      listener.writeToClipboard(decryptedText);
    },
    processError: (err) => {
      console.log('Error:' + err);
    }
  });

  listener.handleClipboardChange((value) => {
    var encryptedValue = crypto.encrypt(value);
    sender.sendMessages({
      body: encryptedValue
    })
  })
}

main().catch((err) => {

  console.log("Error occurred: ", err);
  lockfile.unlockSync('.lock');
});

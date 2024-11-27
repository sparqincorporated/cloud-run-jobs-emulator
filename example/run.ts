import { v2 } from '@google-cloud/run'

(async () => {
  const client = new v2.JobsClient({
    servicePath: '0.0.0.0',
    port: 8123,
    sslCreds: (new v2.JobsClient() as any)._gaxGrpc.grpc.credentials.createInsecure()
  })

  const result = await client.runJob({
    name: 'demo-app',
    validateOnly: false,
    etag: 'etag',
    overrides: {
      taskCount: 1,
      containerOverrides: [{
        env: [
          { name: 'KEY', value: 'VALUE' },
          { name: 'KEY2', value: 'VALUE2' },
          { name: 'KEY3', value: 'VALUE3' }
        ]
      }]
    }
  }).catch((error) => {
    console.log('error', error)
  })

  const bufferData = result[1].response.value;
  if (Buffer.isBuffer(bufferData)) {
    console.log("Decoded string:", bufferData.toString("utf-8"));
  } else {
    console.log("Response field is not a Buffer:", bufferData);
  }
})()

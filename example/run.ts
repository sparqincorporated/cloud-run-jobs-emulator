import { v2 } from '@google-cloud/run'

(() => {
  const client = new v2.JobsClient({
    servicePath: '0.0.0.0',
    port: 8123,
    sslCreds: (new v2.JobsClient() as any)._gaxGrpc.grpc.credentials.createInsecure()
  })

  client.runJob({
    name: 'hello-world',
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
  })
})()

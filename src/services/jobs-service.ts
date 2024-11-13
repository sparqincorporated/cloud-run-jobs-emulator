import { loadPackageDefinition } from '@grpc/grpc-js'
import { protos } from '@google-cloud/run'
import { loadSync } from '@grpc/proto-loader'
import { getProtoPath } from 'google-proto-files'

import { docker, streamContainerLogs } from '@utils/docker'
import { handler } from '@utils/grpc'
import { getConfig } from '@utils/config'
import { Logger, getLogger } from '@utils/logger'
import dockerNames from 'docker-names'

export const jobsServiceDefinitions = loadPackageDefinition(
  loadSync(
    getProtoPath('cloud/run/v2/job.proto'),
    {
      includeDirs: [
        'node_modules/google-proto-files'
      ]
    }
  )
)

export const JobsService = {
  RunJob: handler<protos.google.cloud.run.v2.RunJobRequest, protos.google.longrunning.Operation>(async (call) => {
    const config = getConfig()
    const logger = getLogger(Logger.Job)

    if (!Object.hasOwnProperty.call(config.jobs, call.request.name)) {
      throw new Error('Unknown Job')
    }

    const job = config.jobs[call.request.name]
    logger.info({ name: call.request.name, ...job }, `running job ${call.request.name}`)

    const env = call.request.overrides.containerOverrides[0]?.env.map(e => `${e.name}=${e.value}`)
    const containerName = job.name == null
      ? dockerNames.getRandomName()
      : job.name + "_" + Math.random().toString(36).substring(7)
    const container = await docker.createContainer({
      Image: job.image,
      Env: env,
      name: containerName,
      HostConfig: {
        NetworkMode: job.network,
        Binds: job.volumes,
      },
      Cmd: job.command,
    })

    await container.start()
    await streamContainerLogs(container, logger)

    const { StatusCode } = await container.wait()
    if (StatusCode !== 0) {
      throw new Error(`failed to run job ${call.request.name}, container exited with status ${StatusCode}`)
    }

    return new protos.google.longrunning.Operation({
      response: {}
    })
  })
}

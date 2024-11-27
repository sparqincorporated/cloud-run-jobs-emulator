import { loadPackageDefinition } from "@grpc/grpc-js";
import { protos } from "@google-cloud/run";
import { loadSync } from "@grpc/proto-loader";
import { getProtoPath } from "google-proto-files";

import { docker, streamContainerLogs } from "@utils/docker";
import { handler } from "@utils/grpc";
import { getConfig } from "@utils/config";
import { Logger, getLogger } from "@utils/logger";
import { status as grpcStatus } from "@grpc/grpc-js";
import { Container } from "dockerode";
import { createGrpcError } from "@utils/error";
import { getEnvs } from "@utils/env";
import dockerNames from "docker-names";

export const jobsServiceDefinitions = loadPackageDefinition(
  loadSync(getProtoPath("cloud/run/v2/job.proto"), {
    includeDirs: ["node_modules/google-proto-files"],
  })
);

export const JobsService = {
  RunJob: handler<
    protos.google.cloud.run.v2.RunJobRequest,
    protos.google.longrunning.Operation
  >(async (call) => {
    const logger = getLogger(Logger.Job);
    let container: Container | undefined;

    try {
      const config = getConfig();
      const isJobNotFound = !Object.hasOwnProperty.call(
        config.jobs,
        call.request.name
      );
      if (isJobNotFound) {
        throw createGrpcError(
          grpcStatus.NOT_FOUND,
          `Job not found: ${call.request.name}`,
          {
            jobName: call.request.name,
          }
        );
      }

      const job = config.jobs[call.request.name];
      logger.info(`Running job: ${call.request.name}`, { job });

      // Get environment variables
      const fileEnvs = getEnvs(job.env_file, "/env");
      const envOverrides =
        call.request.overrides.containerOverrides[0]?.env.map(
          (e) => `${e.name}=${e.value}`
        ) || [];

      // Create container
      const containerName =
        job.name == null
          ? dockerNames.getRandomName()
          : job.name + "_" + Math.random().toString(36).substring(7);

      container = await docker.createContainer({
        Image: job.image,
        Env: [...fileEnvs, ...envOverrides],
        name: containerName,
        HostConfig: {
          NetworkMode: job.network,
          Binds: job.volumes,
        },
        Cmd: job.command,
      });

      await container.start();
      await streamContainerLogs(container, logger);

      return new protos.google.longrunning.Operation({
        response: {
          value: Buffer.from(container.id),
        },
      });
    } catch (error: any) {
      logger.error(`Job execution error: ${error.message}`, {
        jobName: call.request.name,
        stack: error.stack,
      });

      if ("code" in error) {
        throw error; // Re-throw gRPC error
      }

      throw createGrpcError(grpcStatus.INVALID_ARGUMENT, error.message, {
        detail_data: JSON.stringify({
          reason: "validation_error",
          field: "email",
        }),
      });
    }
  }),
};

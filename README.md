fork from: https://github.com/kurtschwarz/cloud-run-jobs-emulator

# Google Cloud Run Jobs Emulator

This emulator tries to emulate the behaviour of [Cloud Run Jobs](https://cloud.google.com/run/docs/create-jobs). As of this writing, Google does not provide a [Cloud Run Jobs](https://cloud.google.com/run/docs/create-jobs) emulator, which makes local development a huge pain. This project aims to help you out until they do release an official emulator.

**This project is not associated with Google.**

## Usage

### Docker Compose

To use this emulator with `docker compose` you'll need to add it as a service and create a `cloud-run-jobs-config.yaml` file.

```yaml
services:
  cloud-run-jobs-emulator:
    image: ghcr.io/sparqincorporated/cloud-run-jobs-emulator:latest
    ports:
      - 8123:8123
    configs:
      - source: cloud-run-jobs-config
        target: /cloud-run-jobs-config.yaml
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - CHOKIDAR_USEPOLLING=true

configs:
  cloud-run-jobs-config:
    file: ./example/cloud-run-jobs-config.yaml
```

The `cloud-run-jobs-config.yaml` file should have the following structure:

```yaml
jobs:
  some-awesome-job:
    image: my-docker-image:tag
  another-great-job:
    image: my-docker-image:tag
```

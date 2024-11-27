import { Metadata, ServiceError } from "@grpc/grpc-js";
import { status as grpcStatus } from '@grpc/grpc-js';

/**
 * Create gRPC error
 * @param code - gRPC status code
 * @param message - Error message
 * @param metadataEntries - Metadata key and value pairs (optional)
 * @returns ServiceError object
 */
export function createGrpcError(
  code: grpcStatus,
  message: string,
  metadataEntries?: Record<string, string | Buffer>
): ServiceError {
  const metadata = new Metadata();

  // Initialize metadata
  if (metadataEntries) {
    Object.entries(metadataEntries).forEach(([key, value]) => {
      metadata.add(key, value);
    });
  }

  return {
    code,
    message,
    metadata,
  } as ServiceError;
}

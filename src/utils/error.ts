import { Metadata, ServiceError } from "@grpc/grpc-js";
import { status as grpcStatus } from '@grpc/grpc-js';

/**
 * gRPCエラーを生成する関数
 * @param code - gRPCのステータスコード
 * @param message - エラーのメッセージ
 * @param metadataEntries - メタデータのキーと値のペア（オプション）
 * @returns ServiceErrorオブジェクト
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

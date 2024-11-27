import path from 'path'
import fs from 'fs'

const parseEnv = (filePath: string): string[] => {
  const envPath = path.resolve(filePath);
  const envFileContent = fs.readFileSync(envPath, 'utf8');

  const envLines = envFileContent.split('\n').filter(line => {
    // コメントや空行をスキップ
    const trimmedLine = line.trim()
    return trimmedLine && !trimmedLine.startsWith('#')
  })

  return envLines.map(line => {
    // キーと値を分割してオブジェクトに追加
    const trimmedLine = line.trim()
    const [key, ...valueParts] = trimmedLine.split('=');
    const value = valueParts.join('=').trim();

    return `${key}=${value.replace(/^['"]|['"]$/g, '')}`
  })
}

const resolveEnvFilePaths = (envFiles: string[], composeDir: string): string[] => {
  return envFiles.map((filePath) => {
    // 絶対パスが指定されている場合、そのまま返す
    if (path.isAbsolute(filePath)) {
      throw new Error(`Absolute path is not allowed: ${filePath}`)
    }

    // 相対パスの場合、docker-compose.yml のディレクトリを基準に解決
    const resolvedPath = path.resolve(composeDir, filePath);
    
    // ファイルが存在するか確認
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Env file not found: ${resolvedPath}`);
    }

    return resolvedPath;
  });
}

export const getEnvs = (envFiles: string[], composeDir: string): string[] => {
  const resolvedPaths = resolveEnvFilePaths(envFiles, composeDir);
  let envs: string[] = []
  for (const filePath of resolvedPaths) {
    const env = parseEnv(filePath)
    envs = [...envs, ...env]
  }
  return envs
}

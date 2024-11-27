import path from 'path'
import fs from 'fs'

const parseEnv = (filePath: string): string[] => {
  const envPath = path.resolve(filePath);
  const envFileContent = fs.readFileSync(envPath, 'utf8');

  const envLines = envFileContent.split('\n').filter(line => {
    // Skip comments and empty lines
    const trimmedLine = line.trim()
    return trimmedLine && !trimmedLine.startsWith('#')
  })

  return envLines.map(line => {
    // Split key and value and add to object
    const trimmedLine = line.trim()
    const [key, ...valueParts] = trimmedLine.split('=');
    const value = valueParts.join('=').trim();

    return `${key}=${value.replace(/^['"]|['"]$/g, '')}`
  })
}

const resolveEnvFilePaths = (envFiles: string[], composeDir: string): string[] => {
  return envFiles.map((filePath) => {
    // Return absolute path if specified
    if (path.isAbsolute(filePath)) {
      throw new Error(`Absolute path is not allowed: ${filePath}`)
    }

    // Resolve relative path based on docker-compose.yml directory
    const resolvedPath = path.resolve(composeDir, filePath);

    // Check if file exists
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

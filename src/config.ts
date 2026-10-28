
// Load environment variables from .env file
process.loadEnvFile()

type ApiConfig = {
    fileServerHits: number,
    dbURL: string
}

export let config: ApiConfig = {fileServerHits: 0, dbURL: envOrThrow("DB_URL")};

function envOrThrow(key: string) : string 
{
    let value = process.env[key];

    if (value) return value;

    throw Error(`Key ${key} does not exist within the process environment.`)
}
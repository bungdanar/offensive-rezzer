import { app } from './app'
import { Environment } from './utils/environment'
import { getErrorMessage } from './utils/get-err-message'

const start = async () => {
  try {
    Environment.checkEnvVariables()
  } catch (error) {
    console.error(getErrorMessage(error))
    process.exit(1)
  }

  await app()
}

start()

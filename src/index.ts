import { app } from './app'
import { Environment } from './utils/environment'
import { getErrorMessage } from './utils/get-err-message'
import { consoleLogger } from './utils/logger'

const start = async () => {
  // Check configuration in env file
  // If configuration is not valid, the app should stop immediately
  try {
    Environment.checkEnvVariables()
  } catch (error) {
    consoleLogger.error(getErrorMessage(error))
    process.exit(1)
  }

  // Run the main app
  await app()
}

start()

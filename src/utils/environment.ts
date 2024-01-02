import dotenv from 'dotenv'

dotenv.config()

type AppEnv = {
  MAX_ITER: string
  TARGET_URL?: string
}

export class Environment {
  private static readonly APP_ENV: AppEnv = {
    MAX_ITER: process.env.MAX_ITER!,
    TARGET_URL: process.env.TARGET_URL,
  }

  private static throwEnvErrMsg = (msg: string): never => {
    throw new Error(`${msg} must be defined`)
  }

  static get maxIter(): number {
    return parseInt(this.APP_ENV.MAX_ITER)
  }

  static get targetUrl(): string | undefined {
    if (!this.APP_ENV.TARGET_URL) return undefined

    return this.APP_ENV.TARGET_URL
  }

  static checkEnvVariables = (): void | never => {
    if (!this.APP_ENV.MAX_ITER) {
      this.throwEnvErrMsg('MAX_ITER')
    }

    if (isNaN(parseInt(this.APP_ENV.MAX_ITER))) {
      throw new Error('MAX_ITER is Nan. Please define valid number!')
    }
  }
}

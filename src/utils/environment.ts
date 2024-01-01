import dotenv from 'dotenv'

dotenv.config()

type AppEnv = {
  MAX_ITER: string
}

export class Environment {
  private static readonly APP_ENV: AppEnv = {
    MAX_ITER: process.env.MAX_ITER!,
  }

  private static throwEnvErrMsg = (msg: string): never => {
    throw new Error(`${msg} must be defined`)
  }

  static get maxIter(): number {
    return parseInt(this.APP_ENV.MAX_ITER)
  }

  static checkEnvVariables = (): void | never => {
    for (let key in this.APP_ENV) {
      if (!this.APP_ENV[key as keyof AppEnv]) {
        this.throwEnvErrMsg(key)
      }
    }

    if (isNaN(parseInt(process.env.MAX_ITER!))) {
      throw new Error('MAX_ITER is Nan. Please define valid number!')
    }
  }
}

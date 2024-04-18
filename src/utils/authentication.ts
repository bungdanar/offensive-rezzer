import fs from 'fs/promises'
import { z } from 'zod'
import { consoleLogger } from './logger'

export class Authentication {
  private static authConfigSchema = z.object({
    fullEndpoint: z.string(),
    verb: z.string(),
    contentType: z.string(),
    expectCookies: z.boolean(),
    payload: z.object({
      username: z.string(),
      password: z.string(),
      usernameField: z.string(),
      passwordField: z.string(),
    }),
    token: z.object({
      headerPrefix: z.string(),
      extractFromField: z.string(),
      httpHeaderName: z.string(),
    }),
  })

  static authConfigData: z.infer<typeof this.authConfigSchema> | null = null

  static get includeAuth(): boolean {
    return this.authConfigData !== null
  }

  static loadConfigFile = async () => {
    let configFile: string
    try {
      configFile = await fs.readFile('./auth.json', 'utf-8')
    } catch (error) {
      consoleLogger.info(
        'Config file for auth is not found. Continuing fuzzing without authentication'
      )
      return
    }

    let parsed: any
    try {
      parsed = JSON.parse(configFile)
    } catch (error) {
      consoleLogger.info(
        'Error when parsing config file. Continuing fuzzing without authentication'
      )
      return
    }

    const validationResult = this.authConfigSchema.safeParse(parsed)
    if (!validationResult.success) {
      consoleLogger.info(
        'Auth config is not valid. Continuing fuzzing without authentication'
      )
      return
    }

    this.authConfigData = validationResult.data
    consoleLogger.info('Auth config file is loaded succesfully')
  }
}

async function test() {
  try {
    await Authentication.loadConfigFile()
    console.log('AUTH: ', Authentication.authConfigData)
  } catch (error) {
    consoleLogger.info('Test error')
  }
}

test()

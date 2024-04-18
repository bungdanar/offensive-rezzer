import fs from 'fs/promises'
import { z } from 'zod'
import { consoleLogger } from './logger'
import axios, { AxiosRequestConfig } from 'axios'
import { CommonUtils } from './common'
import { CookieJar } from 'tough-cookie'
import { wrapper } from 'axios-cookiejar-support'

type Token = {
  value: string
  prefix: string
  headerName: string
}

export class Authentication {
  private static authConfigSchema = z.object({
    fullEndpoint: z.string(),
    method: z.string(),
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

  private static enhancedAxios = wrapper(axios)

  private static authConfigData: z.infer<typeof this.authConfigSchema> | null =
    null

  private static _cookie: string[] | undefined = undefined
  private static _token: Token | undefined = undefined
  private static _jar = new CookieJar()

  static get cookie(): string[] | undefined {
    return this._cookie
  }

  static get token(): Token | undefined {
    return this._token
  }

  static get jar() {
    return this._jar
  }

  private static loadConfigFile = async () => {
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

  private static getTokenOrCookie = async () => {
    if (this.authConfigData === null) return

    const { fullEndpoint, method, contentType, payload, expectCookies, token } =
      this.authConfigData

    const config: AxiosRequestConfig = {
      url: fullEndpoint,
      method,
      headers: {
        'Content-Type': contentType,
      },
      data: CommonUtils.serializeBodyPayload({
        [payload.usernameField]: payload.username,
        [payload.passwordField]: payload.password,
      }),
    }

    if (expectCookies) {
      config.withCredentials = true
      config.jar = this._jar
    }

    try {
      const response = await this.enhancedAxios(config)

      if (expectCookies) {
        this._cookie = response.headers['set-cookie']
        this._cookie?.forEach((cookie) => {
          this._jar.setCookieSync(cookie, response.request.host)
        })
      }

      // Try to extract token
      const paths = token.extractFromField.split('/')
      paths.shift()

      let extractedToken: any
      for (let i = 0; i < paths.length; i++) {
        const p = paths[i]
        if (i === 0) {
          extractedToken = response.data[p]
        } else {
          extractedToken = extractedToken[p]
        }
      }

      if (extractedToken !== undefined) {
        this._token = {
          value: extractedToken,
          prefix: token.headerPrefix,
          headerName: token.httpHeaderName,
        }
      }

      consoleLogger.info(
        'Succeeded to get authentication. Continuing fuzzing with authentication'
      )
    } catch (error) {
      consoleLogger.info(
        'Failed to get authentication. Continuing fuzzing without authentication'
      )
    }
  }

  static getAuthOperation = async () => {
    await this.loadConfigFile()
    await this.getTokenOrCookie()
  }
}

// async function test() {
//   try {
//     await Authentication.loadConfigFile()
//     await Authentication.getAuthOperation()
//   } catch (error) {
//     consoleLogger.info('Test error')
//   }
// }

// test()

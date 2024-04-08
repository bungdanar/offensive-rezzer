import { OpenAPI } from 'openapi-types'
import { Environment } from './environment'

export class CommonUtils {
  static hasParameter = (path: string): boolean => {
    const parameterRegex = /\{([^}]+)\}/g
    return parameterRegex.test(path)
  }

  static getTargetUrl = (apiSpec: OpenAPI.Document): string => {
    return Environment.targetUrl !== undefined
      ? Environment.targetUrl
      : //@ts-ignore
        (apiSpec.servers[0].url as string)
  }
}

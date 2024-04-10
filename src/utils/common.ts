import { OpenAPI } from 'openapi-types'
import JSONbig from 'json-bigint'
import { AxiosRequestConfig } from 'axios'
import qs from 'qs'
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

  static serializeBodyPayload = (payload: any) => {
    return JSON.stringify(payload, (key, value) =>
      typeof value === 'bigint' ? JSONbig.stringify(value) : value
    )
  }

  static generateConfigForReqWithBody = ():
    | AxiosRequestConfig<any>
    | undefined => {
    return {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  }

  static generateConfigForReqWithQuery = (
    queryParam: any
  ): AxiosRequestConfig<any> | undefined => {
    return {
      headers: {
        'Content-Type': 'application/json',
      },
      params: queryParam,
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'repeat' }),
    }
  }
}

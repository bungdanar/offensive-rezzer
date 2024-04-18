import { OpenAPI } from 'openapi-types'
import JSONbig from 'json-bigint'
import { AxiosRequestConfig } from 'axios'
import qs from 'qs'
import { Environment } from './environment'
import { Authentication } from './authentication'

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
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (Authentication.cookie !== undefined) {
      config.withCredentials = true
      config.headers = {
        ...config.headers,
        Cookie: Authentication.cookie.join(';'),
      }
    }

    if (Authentication.token !== undefined) {
      const { value, prefix, headerName } = Authentication.token

      config.headers = {
        ...config.headers,
        [headerName]: `${prefix}${value}`,
      }
    }

    return config
  }

  static generateConfigForReqWithQuery = (
    queryParam: any
  ): AxiosRequestConfig<any> | undefined => {
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      params: queryParam,
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: 'repeat' }),
    }

    if (Authentication.cookie !== undefined) {
      config.withCredentials = true
      config.headers = {
        ...config.headers,
        Cookie: Authentication.cookie,
      }
    }

    if (Authentication.token !== undefined) {
      const { value, prefix, headerName } = Authentication.token

      config.headers = {
        ...config.headers,
        [headerName]: `${prefix}${value}`,
      }
    }

    return config
  }

  static extractPathParams = (
    template: string,
    url: string
  ): { [key: string]: any } => {
    const templateParts = template.split('/')
    const urlParts = url.split('/')

    const pathParams: { [key: string]: any } = {}

    for (let i = 0; i < templateParts.length; i++) {
      if (templateParts[i].startsWith('{') && templateParts[i].endsWith('}')) {
        const paramName = templateParts[i].substring(
          1,
          templateParts[i].length - 1
        )
        const paramValue = urlParts[i]
        pathParams[paramName] = paramValue
      }
    }

    return pathParams
  }
}

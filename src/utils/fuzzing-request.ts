import { OpenAPI } from 'openapi-types'
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { AllPayloads } from '../types/common'
import JSONbig from 'json-bigint'
import { consoleLogger, errorLogger } from './logger'
import { Report } from './report'
import { Environment } from './environment'
import { HttpMethods } from '../enums/http-methods'
import qs from 'qs'

export class FuzzingRequest {
  // This is based on common implementation
  private static readonly ALLOWED_METHOD_WITH_REQBODY: string[] = [
    HttpMethods.POST,
    HttpMethods.PATCH,
    HttpMethods.PUT,
  ]

  private static readonly ALLOWED_METHOD_WITH_QUERY: string[] = [
    HttpMethods.GET,
    HttpMethods.DELETE,
  ]

  private static getTargetUrl = (apiSpec: OpenAPI.Document): string => {
    return Environment.targetUrl !== undefined
      ? Environment.targetUrl
      : //@ts-ignore
        (apiSpec.servers[0].url as string)
  }

  private static handleReqError = (
    url: string,
    error: unknown
  ): AxiosResponse | null => {
    let data: AxiosResponse | null = null

    if (error instanceof AxiosError) {
      if (error.response) {
        data = error.response
      } else {
        consoleLogger.error(`Cannot send request to ${url}`)
      }
    } else {
      // Log the error
      errorLogger.error(error)
    }

    return data
  }

  private static handleReqWithQuery = async (
    method: string,
    url: string,
    queryParam: any
  ): Promise<AxiosResponse | null> => {
    let data: AxiosResponse | null = null

    try {
      const config: AxiosRequestConfig<any> | undefined = {
        headers: {
          'Content-Type': 'application/json',
        },
        params: queryParam,
        paramsSerializer: (params) =>
          qs.stringify(params, { arrayFormat: 'repeat' }),
      }

      switch (method) {
        case HttpMethods.GET: {
          data = await axios.get<any>(url, config)
          break
        }

        case HttpMethods.DELETE: {
          data = await axios.delete<any>(url, config)
          break
        }

        default:
          break
      }
    } catch (error) {
      data = this.handleReqError(url, error)
    }

    return data
  }

  private static handleReqWithBody = async (
    method: string,
    url: string,
    payload: any
  ): Promise<AxiosResponse | null> => {
    let data: AxiosResponse | null = null

    try {
      const serializedPayloads = JSON.stringify(payload, (key, value) =>
        typeof value === 'bigint' ? JSONbig.stringify(value) : value
      )

      const config: AxiosRequestConfig<any> | undefined = {
        headers: {
          'Content-Type': 'application/json',
        },
      }

      switch (method) {
        case HttpMethods.POST: {
          data = await axios.post<any>(url, serializedPayloads, config)
          break
        }

        case HttpMethods.PATCH: {
          data = await axios.patch<any>(url, serializedPayloads, config)
          break
        }

        case HttpMethods.PUT: {
          data = await axios.put<any>(url, serializedPayloads, config)
          break
        }

        default:
          break
      }
    } catch (error) {
      data = this.handleReqError(url, error)
    }

    return data
  }

  private static addResponseDataToReport = (
    path: string,
    method: string,
    responses: (AxiosResponse<any, any> | null)[]
  ) => {
    for (let i = 0; i < responses.length; i++) {
      const r = responses[i]

      if (r) {
        let reqBody: any
        let query: any

        try {
          reqBody = JSONbig.parse(r.config.data)
        } catch (error) {
          reqBody = r.config.data
        }

        try {
          query = JSONbig.parse(r.config.params)
        } catch (error) {
          query = r.config.params
        }

        Report.addReportData({
          path,
          method,
          statusCode: r.status,
          reqBody: reqBody !== undefined ? reqBody : {},
          query: query !== undefined ? query : {},
          response: r.data,
        })
      }
    }
  }

  public static sendPayloads = async (
    apiSpec: OpenAPI.Document,
    allPayloads: AllPayloads
  ) => {
    const targetUrl = this.getTargetUrl(apiSpec)

    for (const [path, methods] of Object.entries(allPayloads)) {
      for (const [method, payloads] of Object.entries(methods)) {
        consoleLogger.info(
          `Sending fuzzing payloads to endpoint [${method}] ${path}`
        )

        const normalizedMethod = method.toLowerCase()
        let responses: (AxiosResponse<any, any> | null)[] = []

        if (this.ALLOWED_METHOD_WITH_REQBODY.includes(normalizedMethod)) {
          if (payloads.reqBody.length > 0) {
            responses = await Promise.all(
              payloads.reqBody.map((reqBody) =>
                this.handleReqWithBody(
                  normalizedMethod,
                  `${targetUrl}${path}`,
                  reqBody
                )
              )
            )
          } else {
            responses = await Promise.all([
              this.handleReqWithBody(
                normalizedMethod,
                `${targetUrl}${path}`,
                {}
              ),
            ])
          }
        } else {
          if (payloads.query.length > 0) {
            responses = await Promise.all(
              payloads.query.map((query) =>
                this.handleReqWithQuery(
                  normalizedMethod,
                  `${targetUrl}${path}`,
                  query
                )
              )
            )
          } else {
            responses = await Promise.all([
              this.handleReqWithQuery(
                normalizedMethod,
                `${targetUrl}${path}`,
                {}
              ),
            ])
          }
        }

        this.addResponseDataToReport(path, method, responses)
      }
    }
  }
}

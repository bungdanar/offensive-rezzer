import { OpenAPI } from 'openapi-types'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { AllPayloads } from '../types/common'
import JSONbig from 'json-bigint'
import { consoleLogger, errorLogger } from './logger'
import { Report } from './report'
import { HttpMethods } from '../enums/http-methods'
import { CommonUtils } from './common'
import { wrapper } from 'axios-cookiejar-support'

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

  private static enhancedAxios = wrapper(axios)

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
      const config = CommonUtils.generateConfigForReqWithQuery(queryParam)

      switch (method) {
        case HttpMethods.GET: {
          data = await this.enhancedAxios.get<any>(url, config)
          break
        }

        case HttpMethods.DELETE: {
          data = await this.enhancedAxios.delete<any>(url, config)
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
      const serializedPayload = CommonUtils.serializeBodyPayload(payload)
      const config = CommonUtils.generateConfigForReqWithBody()

      switch (method) {
        case HttpMethods.POST: {
          data = await this.enhancedAxios.post<any>(
            url,
            serializedPayload,
            config
          )
          break
        }

        case HttpMethods.PATCH: {
          data = await this.enhancedAxios.patch<any>(
            url,
            serializedPayload,
            config
          )
          break
        }

        case HttpMethods.PUT: {
          data = await this.enhancedAxios.put<any>(
            url,
            serializedPayload,
            config
          )
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
    targetUrl: string,
    path: string,
    method: string,
    responses: (AxiosResponse<any, any> | null)[]
  ) => {
    for (let i = 0; i < responses.length; i++) {
      const r = responses[i]

      if (r) {
        let pathParams: any = {}
        let reqBody: any
        let query: any

        if (r.config.url) {
          pathParams = CommonUtils.extractPathParams(
            path,
            r.config.url.split(targetUrl)[1]
          )
        }

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
          pathParams,
        })
      }
    }
  }

  public static sendPayloads = async (
    apiSpec: OpenAPI.Document,
    allPayloads: AllPayloads
  ) => {
    const targetUrl = CommonUtils.getTargetUrl(apiSpec)

    for (const [path, methods] of Object.entries(allPayloads)) {
      for (const [method, payloads] of Object.entries(methods)) {
        consoleLogger.info(
          `Sending fuzzing payloads to endpoint [${method}] ${path}`
        )

        const normalizedMethod = method.toLowerCase()
        let responses: (AxiosResponse<any, any> | null)[] = []

        for (let i = 0; i < payloads.realPaths.length; i++) {
          const realPath = payloads.realPaths[i]

          if (this.ALLOWED_METHOD_WITH_REQBODY.includes(normalizedMethod)) {
            if (payloads.reqBody.length > 0) {
              responses = await Promise.all(
                payloads.reqBody.map((reqBody) =>
                  this.handleReqWithBody(
                    normalizedMethod,
                    `${targetUrl}${realPath}`,
                    reqBody
                  )
                )
              )
            } else {
              responses = await Promise.all([
                this.handleReqWithBody(
                  normalizedMethod,
                  `${targetUrl}${realPath}`,
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
                    `${targetUrl}${realPath}`,
                    query
                  )
                )
              )
            } else {
              responses = await Promise.all([
                this.handleReqWithQuery(
                  normalizedMethod,
                  `${targetUrl}${realPath}`,
                  {}
                ),
              ])
            }
          }
        }

        this.addResponseDataToReport(targetUrl, path, method, responses)
      }
    }
  }
}

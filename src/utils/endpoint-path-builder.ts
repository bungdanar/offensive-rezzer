import { OpenAPI } from 'openapi-types'
// import OpenApiParser from '@readme/openapi-parser'
import { CommonUtils } from './common'
import { MethodDetailsHelper } from './check-method-details'
import { CorrectPayloadBuilder } from './correct-payload-builder'
import axios, { AxiosResponse } from 'axios'
import { consoleLogger } from './logger'

class PathComponent {
  private _path: string
  private _isPathParameter: boolean
  private _selfIdx: number
  private _parentIdx: number | null
  private _parameterValue: any | null = null

  constructor(path: string, selfIdx: number, parentIdx: number | null) {
    this._path = path
    this._selfIdx = selfIdx
    this._parentIdx = parentIdx
    this._isPathParameter = CommonUtils.hasParameter(path)
  }

  get path() {
    return this._path
  }

  get isPathParameter() {
    return this._isPathParameter
  }

  get selfIdx() {
    return this._selfIdx
  }

  get parentIdx() {
    return this._parentIdx
  }

  get parameterValue() {
    return this._parameterValue
  }

  set parameterValue(value: any) {
    this._parameterValue = value
  }
}

type GetParamIdResult = { param: any } | null

export class EndpointPathBuilder {
  private static composePathComponents = (path: string): PathComponent[] => {
    const pathStrList = path.split('/')
    if (pathStrList[0] === '') {
      pathStrList.shift()
    }

    const pathComponents: PathComponent[] = []

    if (pathStrList.length > 0) {
      if (pathStrList.length === 1) {
        pathComponents.push(new PathComponent(pathStrList[0], 0, null))
      } else {
        for (let i = 0; i < pathStrList.length; i++) {
          const str = pathStrList[i]

          // First str
          if (i === 0) {
            pathComponents.push(new PathComponent(str, i, null))
            continue
          }

          // Last str
          if (i === pathStrList.length - 1) {
            pathComponents.push(new PathComponent(str, i, i - 1))
            continue
          }

          pathComponents.push(new PathComponent(str, i, i - 1))
        }
      }
    }

    return pathComponents
  }

  private static getParentPath = (
    child: PathComponent,
    pathComponents: PathComponent[]
  ): { realParentPath: string; metaParentPath: string } => {
    const realParentPathStrList: string[] = ['']
    const metaParentPathStrList: string[] = ['']

    if (child.parentIdx === null) {
      realParentPathStrList[0] = '/'
      metaParentPathStrList[0] = '/'
    } else {
      for (let i = 0; i < child.selfIdx; i++) {
        const parent = pathComponents[i]
        const realParentPath = !parent.isPathParameter
          ? parent.path
          : parent.parameterValue

        realParentPathStrList.push(realParentPath)
        metaParentPathStrList.push(parent.path)
      }
    }

    const realParentPath = realParentPathStrList.join('/')
    const metaParentPath = metaParentPathStrList.join('/')

    return { realParentPath, metaParentPath }
  }

  private static generateTestPaylaods = (
    metaParentPath: string,
    apiSpec: OpenAPI.Document
  ): any[] => {
    const testCreatePayloads: any[] = []
    if (
      apiSpec.paths !== undefined &&
      apiSpec.paths[metaParentPath] !== undefined &&
      apiSpec.paths[metaParentPath]!['post'] !== undefined &&
      MethodDetailsHelper.checkIfReqBodySchemaExists(
        apiSpec.paths[metaParentPath]!['post']!
      )
    ) {
      const reqBodySchema = MethodDetailsHelper.getReqBodySchema(
        apiSpec.paths[metaParentPath]!['post']!
      )

      testCreatePayloads.push(
        CorrectPayloadBuilder.generateObjectPayload(reqBodySchema, false)
      )
      testCreatePayloads.push(
        CorrectPayloadBuilder.generateObjectPayload(reqBodySchema, true)
      )
    } else {
      testCreatePayloads.push({})
    }

    return testCreatePayloads
  }

  private static createResourceOperation = async (
    url: string,
    payloads: any[]
  ): Promise<AxiosResponse | null> => {
    let response: AxiosResponse | null = null

    const config = CommonUtils.generateConfigForReqWithBody()

    for (let i = 0; i < payloads.length; i++) {
      const payload = payloads[i]
      const serializedPayload = CommonUtils.serializeBodyPayload(payload)

      try {
        response = await axios.post<any>(url, serializedPayload, config)
        break
      } catch (error) {
        continue
      }
    }

    return response
  }

  private static isObject = (data: unknown) => {
    return typeof data === 'object' && !Array.isArray(data) && data !== null
  }

  private static isArrayAndHasElement = (data: unknown) => {
    return Array.isArray(data) && data.length
  }

  private static getResourceByPossibleId = async (
    url: string,
    id: any
  ): Promise<GetParamIdResult> => {
    const config = CommonUtils.generateConfigForReqWithQuery({})
    try {
      await axios.get<any>(`${url}/${id}`, config)
      return { param: id }
    } catch (error) {
      return null
    }
  }

  private static getOneResourceOperation = async (
    url: string,
    data: any
  ): Promise<GetParamIdResult> => {
    let resourceId: GetParamIdResult = null

    if (this.isArrayAndHasElement(data)) {
      resourceId = await this.getOneResourceOperation(url, data[0])
    } else if (this.isObject(data)) {
      for (const [, value] of Object.entries(data)) {
        resourceId = await this.getOneResourceOperation(url, value)

        if (resourceId !== null) {
          break
        }
      }
    } else {
      // In this point, data is primitive
      resourceId = await this.getResourceByPossibleId(url, data)
    }

    return resourceId
  }

  public static buildPathWithBruteForce = async (
    path: string,
    apiSpec: OpenAPI.Document
  ): Promise<string> => {
    if (!CommonUtils.hasParameter(path)) return path

    const pathComponents = this.composePathComponents(path)

    if (pathComponents.length > 0) {
      for (let i = 0; i < pathComponents.length; i++) {
        const pc = pathComponents[i]

        if (!pc.isPathParameter) {
          continue
        }

        const { realParentPath, metaParentPath } = this.getParentPath(
          pc,
          pathComponents
        )

        const testCreatePayloads = this.generateTestPaylaods(
          metaParentPath,
          apiSpec
        )

        const baseUrl = CommonUtils.getTargetUrl(apiSpec)

        /**
         * Try to create resource
         */
        consoleLogger.info(
          `Attempting to create resource for endpoint: ${realParentPath}`
        )
        const responseFromCreateOperation = await this.createResourceOperation(
          `${baseUrl}${realParentPath}`,
          testCreatePayloads
        )

        if (responseFromCreateOperation === null) {
          consoleLogger.info(
            `Failed to create resource for endpoint: ${realParentPath}. Continuing operation anyway...`
          )
          continue
        }
        consoleLogger.info(
          `Creating resource for endpoint: ${realParentPath} is succeeded`
        )

        /**
         * Try to get a resource
         */
        const metaSelfPath = `${realParentPath}/${pc.path}`

        consoleLogger.info(
          `Attempting to get resource by id from endpoint: ${metaSelfPath}`
        )
        const responseFromGetOperation = await this.getOneResourceOperation(
          `${baseUrl}${realParentPath}`,
          responseFromCreateOperation.data
        )

        if (responseFromGetOperation === null) {
          consoleLogger.info(
            `Failed to get resource from endpoint: ${metaSelfPath}. Continuing operation anyway...`
          )
          continue
        }
        consoleLogger.info(
          `Getting resource from endpoint: ${metaSelfPath} is succeeded`
        )

        // Save valid Id
        pc.parameterValue = responseFromGetOperation.param
      }
    }

    const realSelfPathStrList = pathComponents.map((pc) => {
      if (!pc.isPathParameter) return pc.path

      if (pc.isPathParameter && pc.parameterValue !== null)
        return pc.parameterValue

      return JSON.stringify(pc.parameterValue)
    })
    realSelfPathStrList.unshift('')

    return realSelfPathStrList.join('/')
  }
}

// async function test() {
//   try {
//     const apiSpec = await OpenApiParser.validate('api-spec/openapi.json')
//     await EndpointPathBuilder.buildPathWithBruteForce(
//       '/product/{productId}/shipping/{shippingId}',
//       apiSpec
//     )
//   } catch (error) {
//     consoleLogger.info('Test error')
//   }
// }

// test()

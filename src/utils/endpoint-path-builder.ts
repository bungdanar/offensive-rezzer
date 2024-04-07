import { OpenAPI } from 'openapi-types'
import { CommonUtils } from './common'
import { MethodDetailsHelper } from './check-method-details'
import { CorrectPayloadBuilder } from './correct-payload-builder'

class PathComponent {
  private _path: string
  private _isPathParameter: boolean
  private _selfIdx: number
  private _parentIdx: number | null
  private _childIdx: number | null
  private _parameterValue: any | null = null

  constructor(
    path: string,
    selfIdx: number,
    parentIdx: number | null,
    childIdx: number | null
  ) {
    this._path = path
    this._selfIdx = selfIdx
    this._parentIdx = parentIdx
    this._childIdx = childIdx
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

export class EndpointPathBuilder {
  private static composePathComponents = (path: string): PathComponent[] => {
    const pathStrList = path.split('/')
    if (pathStrList[0] === '') {
      pathStrList.shift()
    }

    const pathComponents: PathComponent[] = []

    if (pathStrList.length > 0) {
      if (pathStrList.length === 1) {
        pathComponents.push(new PathComponent(pathStrList[0], 0, null, null))
      } else {
        for (let i = 0; i < pathStrList.length; i++) {
          const str = pathStrList[i]

          // First str
          if (i === 0) {
            pathComponents.push(new PathComponent(str, i, null, i + 1))
            continue
          }

          // Last str
          if (i === pathStrList.length - 1) {
            pathComponents.push(new PathComponent(str, i, i - 1, null))
            continue
          }

          pathComponents.push(new PathComponent(str, i, i - 1, i + 1))
        }
      }
    }

    return pathComponents
  }

  public static buildPath = async (
    path: string,
    apiSpec: OpenAPI.Document
  ): Promise<string> => {
    if (!CommonUtils.hasParameter(path)) return path

    const pathComponents = this.composePathComponents(path)

    if (pathComponents.length > 0) {
      for (let i = 0; i < pathComponents.length; i++) {
        const ec = pathComponents[i]

        if (!ec.isPathParameter) {
          continue
        }

        const realParentPathStrList: string[] = ['']
        const metaParentPathStrList: string[] = ['']

        if (ec.parentIdx === null) {
          realParentPathStrList[0] = '/'
          metaParentPathStrList[0] = '/'
        } else {
          for (let j = 0; j < ec.selfIdx; j++) {
            const parent = pathComponents[j]
            const realParentPath = !parent.isPathParameter
              ? parent.path
              : parent.parameterValue

            realParentPathStrList.push(realParentPath)
            metaParentPathStrList.push(parent.path)
          }
        }

        const realParentPath = realParentPathStrList.join('/')
        const metaParentPath = metaParentPathStrList.join('/')

        let testCreatePayload: any[] = []
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

          testCreatePayload.push(
            CorrectPayloadBuilder.generateObjectPayload(reqBodySchema, false)
          )
          testCreatePayload.push(
            CorrectPayloadBuilder.generateObjectPayload(reqBodySchema, true)
          )
        } else {
          testCreatePayload.push({})
        }

        // TODO
        // Sending post
        // Sending get by Id
        // Save valid Id
      }
    }

    return path
  }
}

// EndpointPathBuilder.buildPath('/parent/{parentId}/children/{childrenId}')

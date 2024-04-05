import { CommonUtils } from './common'

class EndpointComponent {
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

async function endpointTest() {
  const endpoint = '/parent/{parentId}/children/{childrenId}'

  const endpointStrList = endpoint.split('/')
  if (endpointStrList[0] === '') {
    endpointStrList.shift()
  }

  const endpointComponents: EndpointComponent[] = []

  if (endpointStrList.length > 0) {
    if (endpointStrList.length === 1) {
      endpointComponents.push(
        new EndpointComponent(endpointStrList[0], 0, null, null)
      )
    } else {
      for (let i = 0; i < endpointStrList.length; i++) {
        const str = endpointStrList[i]

        // First str
        if (i === 0) {
          endpointComponents.push(new EndpointComponent(str, i, null, i + 1))
          continue
        }

        // Last str
        if (i === endpointStrList.length - 1) {
          endpointComponents.push(new EndpointComponent(str, i, i - 1, null))
          continue
        }

        endpointComponents.push(new EndpointComponent(str, i, i - 1, i + 1))
      }
    }
  }

  if (endpointComponents.length > 0) {
    for (let i = 0; i < endpointComponents.length; i++) {
      const ec = endpointComponents[i]

      if (!ec.isPathParameter) {
        continue
      }

      // Has no parent
      if (ec.parentIdx === null) {
        // TODO
        // ...
      } else {
        let parentPath: string

        const parent = endpointComponents[ec.parentIdx]
        if (!parent.isPathParameter) {
          parentPath = parent.path
        } else {
          parentPath = parent.parameterValue
        }

        // TODO
        // ...
      }
    }
  }

  console.log(endpointComponents)
}

endpointTest()

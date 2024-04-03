export class MethodDetailsHelper {
  static checkIfReqBodySchemaExists = (methodDetails: {
    [key: string]: any
  }): boolean => {
    return (
      methodDetails['requestBody'] !== undefined &&
      methodDetails['requestBody']['content'] !== undefined &&
      methodDetails['requestBody']['content']['application/json'] !==
        undefined &&
      methodDetails['requestBody']['content']['application/json']['schema'] !==
        undefined
    )
  }

  static getReqBodySchema = (methodDetails: { [key: string]: any }) => {
    return methodDetails['requestBody']['content']['application/json']['schema']
  }

  static checkIfParametersExists = (methodDetails: {
    [key: string]: any
  }): boolean => {
    return (
      methodDetails['parameters'] !== undefined &&
      methodDetails['parameters'].length > 0
    )
  }

  static getParameters = (methodDetails: { [key: string]: any }) => {
    return methodDetails['parameters']
  }
}

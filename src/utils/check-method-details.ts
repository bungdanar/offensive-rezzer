export class MethodDetailsHelper {
  static checkIfSchemaExists = (methodDetails: {
    [key: string]: any
  }): boolean => {
    return (
      methodDetails['requestBody'] &&
      methodDetails['requestBody']['content'] &&
      methodDetails['requestBody']['content']['application/json'] &&
      methodDetails['requestBody']['content']['application/json']['schema']
    )
  }

  static getSchema = (methodDetails: { [key: string]: any }) => {
    return methodDetails['requestBody']['content']['application/json']['schema']
  }
}

export class MethodDetailsHelper {
  static checkIfSchemaExists = (methodDetails: {
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

  static getSchema = (methodDetails: { [key: string]: any }) => {
    return methodDetails['requestBody']['content']['application/json']['schema']
  }
}

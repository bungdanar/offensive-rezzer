export class CommonUtils {
  static hasParameter = (path: string): boolean => {
    const parameterRegex = /\{([^}]+)\}/g
    return parameterRegex.test(path)
  }
}

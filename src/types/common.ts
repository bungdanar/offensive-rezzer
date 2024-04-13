export type InputSpec = {
  [key: string]: any
}

export type ObjectPayload = {
  [key: string]: any
}

export type AllPayloads = {
  // Paths
  [key: string]: PathPayloads
}

export type PathPayloads = {
  // Methods
  [key: string]: MethodPayloads
}

export type MethodPayloads = {
  reqBody: {
    [key: string]: any
  }[]
  query: {
    [key: string]: any
  }[]
  realPaths: string[]
}

export type ReportStruct = {
  // Paths
  [key: string]: {
    // Methods
    [key: string]: {
      statusCode: number
      reqBody: any
      query: any
      response: any
    }[]
  }
}

export type PrettyReportStruct = {
  // Paths
  [key: string]: {
    // Methods
    [key: string]: {
      // Status codes
      [key: number]: {
        numOfRequest: number
        data: {
          reqBody: any
          query: any
          response: any
        }[]
      }
    }
  }
}

export type AddReportData = {
  path: string
  method: string
  statusCode: number
  reqBody: any
  query: any
  response: any
}

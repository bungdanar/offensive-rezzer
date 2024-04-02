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
  [key: string]: {
    [key: string]: any
  }[]
}

export type ReportStruct = {
  // Paths
  [key: string]: {
    // Methods
    [key: string]: {
      statusCode: number
      payload: any
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
          payload: any
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
  payload: any
  response: any
}

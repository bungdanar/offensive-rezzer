export type InputSpec = {
  [key: string]: any
}

export type ObjectPayload = {
  [key: string]: any
}

export type AllPayloads = {
  // Paths
  [key: string]: {
    // Methods
    [key: string]: {
      [key: string]: any
    }[]
  }
}

export type ReportStruct = {
  // Paths
  [key: string]: {
    // Methods
    [key: string]: { statusCode: number; payload: any }[]
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
        payloads: any[]
      }
    }
  }
}

export type AddReportData = {
  path: string
  method: string
  statusCode: number
  payload: any
}

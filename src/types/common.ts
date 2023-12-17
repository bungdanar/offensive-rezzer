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

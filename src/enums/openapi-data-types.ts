export enum SchemaDataTypes {
  STRING = 'string',
  NUMBER = 'number',
  INTEGER = 'integer',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
}

export enum StringRange {
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
}

export enum StringFormats {
  DATE = 'date',
  DATETIME = 'date-time',
  PASSWORD = 'password',
  BYTE = 'byte',
  BINARY = 'binary',
}

// number and integer range
export enum NumberRange {
  MINIMUM = 'minimum',
  MAXIMUM = 'maximum',
}

export enum NumberFormats {
  FLOAT = 'float',
  DOUBLE = 'double',
}

export enum IntegerFormat {
  INT_32 = 'int32',
  INT_64 = 'int64',
}

export enum ArrayFields {
  ITEMS = 'items',
}

export enum ObjectFields {
  PROPERTIES = 'properties',
}

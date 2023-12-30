import { InputSpec, ObjectPayload } from '../../types/common'
import { CorrectPayloadBuilder } from '../correct-payload-builder'

it('returns correct payload for simple object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 5,
      },
      age: {
        type: 'integer',
        minimum: 5,
      },
      wage: {
        type: 'number',
        minimum: 5,
      },
    },
  }

  const expectedWithoutUseSchemaDef: ObjectPayload = {
    name: 'fuzz',
    age: 1,
    wage: 1,
  }

  const expectedWithUseSchemaDef: ObjectPayload = {
    name: 'fffff',
    age: 5,
    wage: 5,
  }

  const resultWithoutUseSchemaDef = CorrectPayloadBuilder.generateObjectPayload(
    objectSchema,
    false
  )
  const resultWithUseSchemaDef = CorrectPayloadBuilder.generateObjectPayload(
    objectSchema,
    true
  )

  expect(resultWithoutUseSchemaDef).toEqual(expectedWithoutUseSchemaDef)
  expect(resultWithUseSchemaDef).toEqual(expectedWithUseSchemaDef)
})

it('returns correct payload for nested object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 5,
      },
      age: {
        type: 'integer',
        minimum: 5,
      },
      monster: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 7,
          },
          weight: {
            type: 'number',
            minimum: 10,
          },
        },
      },
    },
  }

  const expectedWithoutUseSchemaDef: ObjectPayload = {
    name: 'fuzz',
    age: 1,
    monster: {
      name: 'fuzz',
      weight: 1,
    },
  }

  const expectedWithUseSchemaDef: ObjectPayload = {
    name: 'fffff',
    age: 5,
    monster: {
      name: 'fffffff',
      weight: 10,
    },
  }

  const resultWithoutUseSchemaDef = CorrectPayloadBuilder.generateObjectPayload(
    objectSchema,
    false
  )
  const resultWithUseSchemaDef = CorrectPayloadBuilder.generateObjectPayload(
    objectSchema,
    true
  )

  expect(resultWithoutUseSchemaDef).toEqual(expectedWithoutUseSchemaDef)
  expect(resultWithUseSchemaDef).toEqual(expectedWithUseSchemaDef)
})

it('returns correct payload for object with nested simple array', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 5,
      },
      age: {
        type: 'integer',
        minimum: 5,
      },
      grades: {
        type: 'array',
        items: {
          type: 'number',
          minimum: 75,
        },
      },
    },
  }

  const expectedWithoutUseSchemaDef: ObjectPayload = {
    name: 'fuzz',
    age: 1,
    grades: [1],
  }

  const expectedWithUseSchemaDef: ObjectPayload = {
    name: 'fffff',
    age: 5,
    grades: [75],
  }

  const resultWithoutUseSchemaDef = CorrectPayloadBuilder.generateObjectPayload(
    objectSchema,
    false
  )
  const resultWithUseSchemaDef = CorrectPayloadBuilder.generateObjectPayload(
    objectSchema,
    true
  )

  expect(resultWithoutUseSchemaDef).toEqual(expectedWithoutUseSchemaDef)
  expect(resultWithUseSchemaDef).toEqual(expectedWithUseSchemaDef)
})

it('returns correct payload for object with nested array of object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 5,
      },
      age: {
        type: 'integer',
        minimum: 5,
      },
      monsters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 7,
            },
            weight: {
              type: 'number',
              minimum: 10,
            },
          },
        },
      },
    },
  }

  const expectedWithoutUseSchemaDef: ObjectPayload = {
    name: 'fuzz',
    age: 1,
    monsters: [
      {
        name: 'fuzz',
        weight: 1,
      },
    ],
  }

  const expectedWithUseSchemaDef: ObjectPayload = {
    name: 'fffff',
    age: 5,
    monsters: [
      {
        name: 'fffffff',
        weight: 10,
      },
    ],
  }

  const resultWithoutUseSchemaDef = CorrectPayloadBuilder.generateObjectPayload(
    objectSchema,
    false
  )
  const resultWithUseSchemaDef = CorrectPayloadBuilder.generateObjectPayload(
    objectSchema,
    true
  )

  expect(resultWithoutUseSchemaDef).toEqual(expectedWithoutUseSchemaDef)
  expect(resultWithUseSchemaDef).toEqual(expectedWithUseSchemaDef)
})

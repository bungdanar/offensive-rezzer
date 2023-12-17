import { InputSpec, ObjectPayload } from '../../types/common'
import { MissingPayloadBuilder } from '../missing-payload-builder'

it('returns expected payload variants for simple object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
  }

  const expected: ObjectPayload[] = [
    {
      age: 33,
    },
    {
      name: 'danar',
    },
  ]

  const result = MissingPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns expected payload variants for nested object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
      monster: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          age: {
            type: 'integer',
          },
        },
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
    monster: {
      name: 'charmender',
      age: 1,
    },
  }

  const expected: ObjectPayload[] = [
    {
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
      },
    },
  ]

  const result = MissingPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns expected payload variants for object with nested simple array', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
      tags: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
    tags: ['beginner'],
  }

  const expected: ObjectPayload[] = [
    {
      age: 33,
      tags: ['beginner'],
    },
    {
      name: 'danar',
      tags: ['beginner'],
    },
    {
      name: 'danar',
      age: 33,
    },
    {
      name: 'danar',
      age: 33,
      tags: [],
    },
  ]

  const result = MissingPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns expected payload variants for object with nested simple array', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
      monsters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
            },
            age: {
              type: 'integer',
            },
          },
        },
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
    monsters: [
      {
        name: 'charmender',
        age: 1,
      },
    ],
  }

  const expected: ObjectPayload[] = [
    {
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
    },
    {
      name: 'danar',
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
    },
    {
      name: 'danar',
      age: 33,
      monsters: [],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          age: 1,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
        },
      ],
    },
  ]

  const result = MissingPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

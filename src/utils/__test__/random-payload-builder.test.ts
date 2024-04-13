import crypto from 'crypto'

import { InputSpec, ObjectPayload } from '../../types/common'
import { RandomPayloadBuilder } from '../random-payload-builder'

const uuid = crypto.randomUUID()
RandomPayloadBuilder.generateRandomValues = jest.fn(() => [
  null,
  undefined,
  uuid,
])

it('returns random payload variants for simple object', () => {
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
      name: null,
      age: 33,
    },
    {
      name: undefined,
      age: 33,
    },
    {
      name: uuid,
      age: 33,
    },
    {
      name: 'danar',
      age: null,
    },
    {
      name: 'danar',
      age: undefined,
    },
    {
      name: 'danar',
      age: uuid,
    },
  ]

  const result = RandomPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns random payload variants for nested object', () => {
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
      name: null,
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: undefined,
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: uuid,
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: null,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: undefined,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: uuid,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: null,
    },
    {
      name: 'danar',
      age: 33,
      monster: undefined,
    },
    {
      name: 'danar',
      age: 33,
      monster: uuid,
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: null,
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: undefined,
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: uuid,
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: null,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: undefined,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: uuid,
      },
    },
  ]

  const result = RandomPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns random payload variants for object with nested simple array', () => {
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
      name: null,
      age: 33,
      tags: ['beginner'],
    },
    {
      name: undefined,
      age: 33,
      tags: ['beginner'],
    },
    {
      name: uuid,
      age: 33,
      tags: ['beginner'],
    },
    {
      name: 'danar',
      age: null,
      tags: ['beginner'],
    },
    {
      name: 'danar',
      age: undefined,
      tags: ['beginner'],
    },
    {
      name: 'danar',
      age: uuid,
      tags: ['beginner'],
    },
    {
      name: 'danar',
      age: 33,
      tags: null,
    },
    {
      name: 'danar',
      age: 33,
      tags: undefined,
    },
    {
      name: 'danar',
      age: 33,
      tags: uuid,
    },
    {
      name: 'danar',
      age: 33,
      tags: [null],
    },
    {
      name: 'danar',
      age: 33,
      tags: [undefined],
    },
    {
      name: 'danar',
      age: 33,
      tags: [uuid],
    },
  ]

  const result = RandomPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns random payload variants for object with nested array of object', () => {
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
      name: null,
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
    },
    {
      name: undefined,
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
    },
    {
      name: uuid,
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
      age: null,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
    },
    {
      name: 'danar',
      age: undefined,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
    },
    {
      name: 'danar',
      age: uuid,
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
      monsters: null,
    },
    {
      name: 'danar',
      age: 33,
      monsters: undefined,
    },
    {
      name: 'danar',
      age: 33,
      monsters: uuid,
    },
    {
      name: 'danar',
      age: 33,
      monsters: [null],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [undefined],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [uuid],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: null,
          age: 1,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: undefined,
          age: 1,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: uuid,
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
          age: null,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: undefined,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: uuid,
        },
      ],
    },
  ]

  const result = RandomPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

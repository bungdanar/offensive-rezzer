import { CommonUtils } from '../common'

it('returns path params object with one field', () => {
  const template = '/product/{productId}'
  const url = '/product/kmzwa8awaa'

  const expected = {
    productId: 'kmzwa8awaa',
  }

  const result = CommonUtils.extractPathParams(template, url)

  expect(result).toEqual(expected)
})

it('returns path params object with one field', () => {
  const template = '/product/{productId}/shipping'
  const url = '/product/23/shipping'

  const expected = {
    productId: '23',
  }

  const result = CommonUtils.extractPathParams(template, url)

  expect(result).toEqual(expected)
})

it('returns path params object with two fields', () => {
  const template = '/product/{productId}/shipping/{shippingId}'
  const url = '/product/1/shipping/5'

  const expected = {
    productId: '1',
    shippingId: '5',
  }

  const result = CommonUtils.extractPathParams(template, url)

  expect(result).toEqual(expected)
})

it('returns empty path params object', () => {
  const template = '/product'
  const url = '/product'

  const expected = {}

  const result = CommonUtils.extractPathParams(template, url)

  expect(result).toEqual(expected)
})

import { describe, it, expect } from 'vitest'
import { cn, parseLocalDate } from './utils'

describe('cn', () => {
  it('combines class names', () => {
    expect(cn('p-2', 'm-4')).toBe('p-2 m-4')
  })

  it('merges tailwind variants correctly', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('handles conditional values and arrays', () => {
    expect(cn({ hidden: false, block: true }, ['text-sm', 'text-lg'])).toBe('block text-lg')
  })
})

describe('parseLocalDate', () => {
  it('parses ISO date strings as local dates', () => {
    const d = parseLocalDate('2024-05-21T00:00:00.000Z')
    expect(d.getFullYear()).toBe(2024)
    expect(d.getMonth()).toBe(4)
    expect(d.getDate()).toBe(21)
  })
})

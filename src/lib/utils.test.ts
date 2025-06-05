import { describe, it, expect } from 'vitest'
import { cn } from './utils'

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

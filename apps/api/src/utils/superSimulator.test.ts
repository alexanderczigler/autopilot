import { describe, expect, it } from 'vitest'
import { getTicketPrice } from './superSimulator.js'

describe('getTicketPrice', () => {
  describe('ARN/DBX', () => {
    it('should calculate the eco price', () => {
      expect(getTicketPrice(1789, 151 * 2, 379)).toBe(1910)
    })
    it('should calculate the bus price', () => {
      expect(getTicketPrice(2379, 81 * 2, 83)).toBe(1624)
    })
    it('should calculate the first price', () => {
      expect(getTicketPrice(4114, 34 * 2, 30)).toBe(2376)
    })
    it('should calculate the cargo price', () => {
      expect(getTicketPrice(7667, 537 * 2, 1987)).toBe(8841)
    })
  })
  describe('ORY/MPM', () => {
    it('should calculate the eco price', () => {
      expect(getTicketPrice(3216, 187 * 2, 477)).toBe(3447)
    })
    it('should calculate the bus price', () => {
      expect(getTicketPrice(4277, 101 * 2, 39)).toBe(1718)
    })
    it('should calculate the first price', () => {
      expect(getTicketPrice(7396, 43 * 2, 4)).toBe(3081)
    })
    it('should calculate the cargo price', () => {
      expect(getTicketPrice(12649, 539 * 2, 1802)).toBe(14343)
    })
  })
})

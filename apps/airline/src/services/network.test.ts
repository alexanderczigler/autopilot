import type { Route } from '@autopilot/shared'
import { describe, expect, it } from 'vitest'
import { getCapacity } from './network.js'

describe('Circuits Service', () => {
  describe('getCapacity', () => {
    describe('ARN', () => {
      const route: Route = {
        id: 'test-route',
        departure: { id: 'ARN', name: 'Arlanda' },
        destination: { id: 'LAX', name: 'Los Angeles' },
      }

      it('should return the capacity for a given cargo class', async () => {
        const capacity = getCapacity(route)

        expect(capacity?.economy).toBe(2840)
        expect(capacity?.business).toBe(480)
        expect(capacity?.first).toBe(112)
        expect(capacity?.cargo).toBe(88)
      })
    })

    describe('BMA', () => {
      const route: Route = {
        id: 'test-route',
        departure: { id: 'BMA', name: 'Bromma' },
        destination: { id: 'UME', name: 'Visby' },
      }

      it('should return the capacity for a given cargo class', async () => {
        const capacity = getCapacity(route)

        expect(capacity?.economy).toBe(750)
        expect(capacity?.business).toBe(160)
        expect(capacity?.first).toBe(40)
        expect(capacity?.cargo).toBe(50)
      })
    })

    describe('DEN', () => {
      const route: Route = {
        id: 'test-route',
        departure: { id: 'DEN', name: 'Denver' },
        destination: { id: 'ANC', name: 'Anchorage' },
      }

      it('should return the capacity for a given cargo class', async () => {
        const capacity = getCapacity(route)

        expect(capacity?.economy).toBe(462)
        expect(capacity?.business).toBe(88)
        expect(capacity?.first).toBe(16)
        expect(capacity?.cargo).toBe(134)
      })
    })
  })
})

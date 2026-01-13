import { describe, it, expect } from 'vitest'
import { generatePageNumbers } from './pagination'

describe('Pagination Utilities', () => {
  describe('generatePageNumbers', () => {
    it('should generate all page numbers when total pages is small', () => {
      const result = generatePageNumbers(2, 3)
      expect(result).toEqual([1, 2, 3])
    })

    it('should generate page numbers with ellipsis for large page counts', () => {
      const result = generatePageNumbers(5, 10)
      expect(result).toEqual([1, '...', 4, 5, 6, '...', 10])
    })

    it('should handle first page correctly', () => {
      const result = generatePageNumbers(1, 10)
      expect(result).toEqual([1, 2, '...', 10])
    })

    it('should handle last page correctly', () => {
      const result = generatePageNumbers(10, 10)
      expect(result).toEqual([1, '...', 9, 10])
    })

    it('should handle single page', () => {
      const result = generatePageNumbers(1, 1)
      expect(result).toEqual([1])
    })

    it('should handle pages near the beginning', () => {
      const result = generatePageNumbers(2, 10)
      expect(result).toEqual([1, 2, 3, '...', 10])
    })

    it('should handle pages near the end', () => {
      const result = generatePageNumbers(9, 10)
      expect(result).toEqual([1, '...', 8, 9, 10])
    })

    it('should respect maxVisible parameter', () => {
      const result = generatePageNumbers(5, 20, 7)
      expect(result).toEqual([1, '...', 4, 5, 6, '...', 20])
    })
  })
})
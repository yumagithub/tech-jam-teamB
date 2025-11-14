import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HotpepperClient, HotpepperApiError } from '../client';
import type { HotpepperApiResponse } from '../types';

// fetchのモック
global.fetch = vi.fn();

describe('HotpepperClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('環境変数からAPI Keyを取得できること', () => {
      process.env.HOTPEPPER_API_KEY = 'test-api-key';
      const client = new HotpepperClient();
      expect(client).toBeInstanceOf(HotpepperClient);
    });

    it('引数でAPI Keyを渡せること', () => {
      const client = new HotpepperClient('custom-api-key');
      expect(client).toBeInstanceOf(HotpepperClient);
    });

    it('API Keyが設定されていない場合、エラーをthrowすること', () => {
      const originalKey = process.env.HOTPEPPER_API_KEY;
      delete process.env.HOTPEPPER_API_KEY;

      expect(() => new HotpepperClient()).toThrow('API key is not configured');
      expect(() => new HotpepperClient()).toThrow(HotpepperApiError);

      // 元に戻す
      process.env.HOTPEPPER_API_KEY = originalKey;
    });

    it('エラーのstatusCodeが500であること', () => {
      const originalKey = process.env.HOTPEPPER_API_KEY;
      delete process.env.HOTPEPPER_API_KEY;

      try {
        new HotpepperClient();
      } catch (error) {
        expect(error).toBeInstanceOf(HotpepperApiError);
        expect((error as HotpepperApiError).statusCode).toBe(500);
      }

      // 元に戻す
      process.env.HOTPEPPER_API_KEY = originalKey;
    });
  });

  describe('search', () => {
    it('正しいパラメータでAPIを呼び出すこと', async () => {
      const mockResponse: HotpepperApiResponse = {
        results: {
          results_available: '10',
          shop: [],
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new HotpepperClient('test-api-key');
      await client.search({ keyword: 'ラーメン' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('keyword=%E3%83%A9%E3%83%BC%E3%83%A1%E3%83%B3'),
        expect.any(Object)
      );
    });

    it('レスポンスを正しく返すこと', async () => {
      const mockResponse: HotpepperApiResponse = {
        results: {
          results_available: '10',
          shop: [
            {
              id: '1',
              name: 'Test Restaurant',
              photo: { pc: { l: 'http://example.com/photo.jpg' } },
              budget: { name: '3000円' },
              genre: { name: '居酒屋' },
              catch: 'おいしい',
              address: '東京都',
              party_capacity: '20',
            },
          ],
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new HotpepperClient('test-api-key');
      const result = await client.search({ keyword: 'test' });

      expect(result).toEqual(mockResponse.results);
      expect(result.shop).toHaveLength(1);
      expect(result.shop[0].name).toBe('Test Restaurant');
    });

    it('APIエラー時に適切なエラーをthrowすること', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const client = new HotpepperClient('test-api-key');

      await expect(client.search({ keyword: 'test' })).rejects.toThrow(
        'HTTP error! status: 404'
      );
      await expect(client.search({ keyword: 'test' })).rejects.toThrow(
        HotpepperApiError
      );
    });

    it('ネットワークエラー時に適切なエラーをthrowすること', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
        new Error('Network error')
      );

      const client = new HotpepperClient('test-api-key');

      await expect(client.search({ keyword: 'test' })).rejects.toThrow(
        'Failed to fetch data from Hotpepper API'
      );
    });

    it('オプショナルパラメータが正しく適用されること', async () => {
      const mockResponse: HotpepperApiResponse = {
        results: {
          results_available: '0',
          shop: [],
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new HotpepperClient('test-api-key');
      await client.search({
        keyword: 'test',
        budget: 'B001',
        genre: 'G001',
        party_capacity: '10',
        start: '1',
        count: '20',
      });

      const callUrl = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callUrl).toContain('budget=B001');
      expect(callUrl).toContain('genre=G001');
      expect(callUrl).toContain('party_capacity=10');
      expect(callUrl).toContain('count=20');
    });
  });

  describe('getById', () => {
    it('正しいIDでAPIを呼び出すこと', async () => {
      const mockResponse: HotpepperApiResponse = {
        results: {
          results_available: '1',
          shop: [],
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new HotpepperClient('test-api-key');
      await client.getById('J001234567');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('id=J001234567'),
        expect.any(Object)
      );
    });

    it('レスポンスを正しく返すこと', async () => {
      const mockResponse: HotpepperApiResponse = {
        results: {
          results_available: '1',
          shop: [
            {
              id: 'J001234567',
              name: 'Test Restaurant',
              photo: { pc: { l: 'http://example.com/photo.jpg' } },
              budget: { name: '3000円' },
              genre: { name: '居酒屋' },
              catch: 'おいしい',
              address: '東京都',
              party_capacity: '20',
            },
          ],
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const client = new HotpepperClient('test-api-key');
      const result = await client.getById('J001234567');

      expect(result).toEqual(mockResponse.results);
      expect(result.shop[0].id).toBe('J001234567');
    });

    it('IDがない場合に400エラーをthrowすること', async () => {
      const client = new HotpepperClient('test-api-key');

      await expect(client.getById('')).rejects.toThrow('Restaurant ID is required');

      try {
        await client.getById('');
      } catch (error) {
        expect(error).toBeInstanceOf(HotpepperApiError);
        expect((error as HotpepperApiError).statusCode).toBe(400);
      }
    });

    it('APIエラー時に適切なエラーをthrowすること', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const client = new HotpepperClient('test-api-key');

      await expect(client.getById('J001234567')).rejects.toThrow(
        'HTTP error! status: 500'
      );
    });
  });
});

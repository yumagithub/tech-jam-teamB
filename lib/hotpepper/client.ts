import {
  HotpepperApiResponse,
  SearchParams,
  ApiResults,
} from './types';
import {
  HOTPEPPER_BASE_URL,
  DEFAULT_LARGE_AREA_CODE,
  DEFAULT_RESULTS_COUNT,
  API_FORMAT,
} from './constants';

export class HotpepperApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'HotpepperApiError';
  }
}

export class HotpepperClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.HOTPEPPER_API_KEY;

    if (!key) {
      throw new HotpepperApiError('API key is not configured', 500);
    }

    this.apiKey = key;
    this.baseUrl = HOTPEPPER_BASE_URL;
  }

  /**
   * レストランを検索する
   */
  async search(params: SearchParams): Promise<ApiResults> {
    const searchParams = new URLSearchParams({
      key: this.apiKey,
      format: API_FORMAT,
      large_area: params.large_area || DEFAULT_LARGE_AREA_CODE,
      start: params.start || '1',
      count: params.count || String(DEFAULT_RESULTS_COUNT),
    });

    // オプショナルパラメータを追加
    if (params.keyword) {
      searchParams.append('keyword', params.keyword);
    }
    if (params.budget) {
      searchParams.append('budget', params.budget);
    }
    if (params.genre) {
      searchParams.append('genre', params.genre);
    }
    if (params.party_capacity) {
      searchParams.append('party_capacity', params.party_capacity);
    }

    const url = `${this.baseUrl}?${searchParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new HotpepperApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      const data: HotpepperApiResponse = await response.json();
      return data.results;
    } catch (error) {
      if (error instanceof HotpepperApiError) {
        throw error;
      }
      throw new HotpepperApiError(
        `Failed to fetch data from Hotpepper API: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * IDでレストラン詳細を取得する
   */
  async getById(id: string): Promise<ApiResults> {
    if (!id) {
      throw new HotpepperApiError('Restaurant ID is required', 400);
    }

    const searchParams = new URLSearchParams({
      key: this.apiKey,
      id,
      format: API_FORMAT,
    });

    const url = `${this.baseUrl}?${searchParams.toString()}`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new HotpepperApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      const data: HotpepperApiResponse = await response.json();
      return data.results;
    } catch (error) {
      if (error instanceof HotpepperApiError) {
        throw error;
      }
      throw new HotpepperApiError(
        `Failed to fetch data from Hotpepper API: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}

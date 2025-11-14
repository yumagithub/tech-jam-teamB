// Hotpepper API Types

export interface Shop {
  id: string;
  name: string;
  photo: {
    pc: {
      l: string;
    };
  };
  budget: {
    name: string;
  };
  genre: {
    name: string;
  };
  catch: string;
  address: string;
  party_capacity: string;
}

export interface SearchParams {
  keyword?: string;
  budget?: string;
  genre?: string;
  party_capacity?: string;
  start?: string;
  count?: string;
  large_area?: string;
}

export interface ApiResults {
  results_available: string;
  shop: Shop[];
}

export interface HotpepperApiResponse {
  results: ApiResults;
}

export interface HotpepperErrorResponse {
  results: {
    error: Array<{
      message: string;
      code: string;
    }>;
  };
}

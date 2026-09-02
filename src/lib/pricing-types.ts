export interface VolumeTier {
  quantity: number;
  totalPrice: number;
  perLeadPrice: number;
  savings: number;
  badge: string | null;
  discountLabel: string | null;
}

export interface CategoryPrice {
  slug: string;
  name: string;
  basePrice: number;
}

export interface ExclusiveLeadExample {
  category: string;
  age: string;
  score: number;
  price: number;
}

export interface SubscriptionPlan {
  slug: string;
  name: string;
  monthlyPrice: number;
  includedLeads: number;
  badge: string | null;
  featured: boolean;
  description: string;
  features: string[];
  cta: string;
}

export interface PricingConfig {
  singleLead: {
    basePrice: number;
    currency: string;
  };
  volumeTiers: VolumeTier[];
  categories: CategoryPrice[];
  exclusive: {
    basePrice: number;
    exampleLead: ExclusiveLeadExample;
  };
  subscriptions: SubscriptionPlan[];
  settings: {
    noSubscriptionRequired: boolean;
  };
}

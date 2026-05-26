export type InSalesOptionValue = {
  id?: number;
  option_name?: string;
  option_name_id?: number;
  position?: number;
  title: string;
};

export type InSalesVariant = {
  available?: boolean;
  base_price?: string | number;
  id: number;
  old_price?: string | number;
  option_values?: InSalesOptionValue[];
  price?: string | number;
  quantity?: number;
  sku?: string | null;
  title: string;
};

export type InSalesImage = {
  id: number;
  original_url?: string | null;
};

export type InSalesProduct = {
  category_id?: number | null;
  description?: string | null;
  handle?: string | null;
  id: number;
  images?: InSalesImage[];
  is_hidden?: boolean;
  short_description?: string | null;
  title: string;
  variants?: InSalesVariant[];
};

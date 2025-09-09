export interface CreateAdvert {
  shopId: string;
  productId: string;
  advertType: string;
  picture: string;
  title: string;
  writeup: string;
  url: string;
  startDate: Date;
  endDate: Date;
  amountPaidForAd: number;
  states: string[];
}

export interface UpdateAdvert extends CreateAdvert {
    advertId: string;
}

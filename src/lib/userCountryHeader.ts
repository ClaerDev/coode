import { pppCoupons } from "@/data/pppCoupons";
import { headers } from "next/headers";

const COUNTRY_HEADER_KEY = "x-user-country";

export function setUserCountryHeader(
  headers: Headers,
  country: string | undefined
) {
  if (country == null) {
    headers.delete(COUNTRY_HEADER_KEY);
  } else {
    headers.set(COUNTRY_HEADER_KEY, country);
  }
}

async function getUserCountry() {
  const head = await headers();
  return head.get(COUNTRY_HEADER_KEY);
}

export async function getUserCoupon() {
  const country = await getUserCountry();
  if (country == null) return;

  const coupon = pppCoupons.find((coupon) =>
    coupon.countryCodes.includes(country)
  );

  if (coupon == null) return;

  return {
    stripeCouponId: coupon.stripeCouponId,
    discountPercentage: coupon.discountPercentage,
  };
}

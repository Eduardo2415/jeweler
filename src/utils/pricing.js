export function hasActiveSale(product) {
  const regularPrice = Number(product?.price)
  const salePrice = Number(product?.sale_price)

  return Number.isFinite(salePrice) && salePrice > 0 && salePrice < regularPrice
}

export function getEffectivePrice(product) {
  return hasActiveSale(product) ? Number(product.sale_price) : Number(product?.price) || 0
}

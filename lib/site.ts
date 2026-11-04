// Canonical site address and the shop's contact details, shared by metadata,
// the sitemap, the footer and the LocalBusiness structured data. Keep the
// address and phone identical to Google Business, Facebook and Zalo.
export const SITE_URL = 'https://www.hmworkshop.vn'

export const BUSINESS = {
  name: 'HMWorkshop',
  phone: '0984702938',
  phoneIntl: '+84984702938',
  email: 'ductn19970411@gmail.com',
  street: 'Phước Đồng',
  locality: 'Nha Trang',
  region: 'Khánh Hòa',
  addressText: 'Phước Đồng, Nam Nha Trang, Khánh Hòa',
  facebook: 'https://www.facebook.com/profile.php?id=61550244332051',
  zalo: 'https://zalo.me/0984702938'
}

/** schema.org LocalBusiness for the shop, rendered once in the root layout. */
export const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${SITE_URL}/#business`,
  name: BUSINESS.name,
  description:
    'Xưởng in 3D theo yêu cầu tại Nha Trang: mô hình, quà tặng, đèn ngủ, decor in bằng nhựa PETG.',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  image: `${SITE_URL}/hero-image.jpg`,
  telephone: BUSINESS.phoneIntl,
  email: BUSINESS.email,
  priceRange: '100.000đ+',
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.street,
    addressLocality: BUSINESS.locality,
    addressRegion: BUSINESS.region,
    addressCountry: 'VN'
  },
  areaServed: ['Nha Trang', 'Khánh Hòa', 'Việt Nam'],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00'
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday', 'Sunday'],
      opens: '09:00',
      closes: '17:00'
    }
  ],
  sameAs: [BUSINESS.facebook, BUSINESS.zalo]
}

# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [ 1.2.5 ]

### Added

- Added support for Review field.

### Fixed

- Updated brand type from "Thing" to "Brand".

## [ 1.2.4 ]

### Added

- Added support for AggregateRating.

## [ 1.2.3 ]

### Fixed

- Search breadcrumbs no longer produce malformed JSON.

## [ 1.2.2 ]

### Changed

- A couple of Italian translations were updated.

## [ 1.2.1 ]

### Changed

- priceCurrency for products now reflects the selected currency for stores that support multi-currency.

### Removed

- Review and AggregateReview data from the Shopify Product Review app is no longer included - the metadata changed in an incompatible way.

## [ 1.2.0 ]

### Added

- Added translations for 21 new locales. If your theme is missing any of these locales you will need Paskit >=1.8.0 to avoid a build error.

## [ 1.1.1 ]

- Added dateModified and Logo fields for articles.

## [ 1.1.0 ]

### Added

- Now provides review and AggregateReview data for products that have reviews from Shopify's Product Review app.
- Barcode data is now included for products that include one.
- Provides a priceValidUntil value of 1 year into the future to eliminate a Google recommendation.

## [ 1.0.2 ]

### Fixed
- Added URL property to Product data
- Fixed missing breadcrumbs on homepage

## [1.0.1] - 07-25-2018
- Eliminated some unnecessary escaping in the translation of tags
- Added a check to generate correct breadcrumb url for /collections/all
## [1.0.0] - 05-17-2018

Initial Shopify Structured Data release

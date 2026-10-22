# our reviewer notes

## Architecture
This is a small React product-store application, centered in `BuggyProductApp.jsx`. The file combines a presentational demo component, reusable pure catalog/cart operations in `productStoreLogic`, constants, currency formatting, and custom hooks such as `useDebouncedValue` and `useProductCatalog`. `reviewPullRequest.ts` is an independent TypeScript utility containing asynchronous PR-review workflow steps.

## Conventions
- Product records use numeric `id`, `price`, and `stock`; richer catalog records also include `category` (`BuggyProductApp.jsx`, `DEFAULT_CATALOG`).
- Catalog operations are exposed as methods on `productStoreLogic`, and generally return new arrays rather than mutate inputs: `addProduct`, `updateProduct`, `deleteProduct`, and `adjustStock`.
- Validation returns arrays of human-readable errors (`validateProduct`, `validateCatalog`); state-changing operations commonly return `{ products/cart, error }`, while checkout returns `{ ok, ... }`.
- Cart entries in the reusable logic carry a `quantity`; totals therefore multiply `item.price * item.quantity` in `cartSubtotal`. Do not treat this API as equivalent to the demo component’s legacy cart, which stores product objects directly.
- Filtering and searching are case-insensitive through `normalizeText`; sorting clones before calling `.sort()` (`sortProducts`).
- Pagination is one-based and clamps `page` and `pageSize` to at least `1` (`paginate`).
- Currency is formatted in Indian rupees using `en-IN` locale and rounded to whole units (`formatCurrency`).
- React hooks use standard cleanup for timers: `useDebouncedValue` clears its timeout in the effect cleanup.

## Watch out for
- Flag stale-state updates in the component handlers: `addToCart`, `removeFromCart`, `checkout`, `updateStock`, and `increaseDiscount` close over state and use direct setters. Rapid events can lose updates; functional setters or a reducer are safer.
- The demo UI does not enforce the reusable cart invariants: `addToCart` ignores stock and quantity, `calculateTotal` ignores quantities/discounts, and `checkout` does not decrement stock. Changes should preserve whichever API is intended rather than silently mixing the two models.
- `updateStock` clamps stock to zero, while `productStoreLogic.adjustStock` rejects decrements below zero. Do not introduce inconsistent stock semantics between these paths.
- `setCartQuantity` validates against current product stock, and `checkout` validates the cart again; callers must handle returned errors instead of assuming success.
- `validateCatalog` should not be called with malformed non-array data without checking its early error result; duplicate-ID checks rely on optional chaining for malformed rows.
- Avoid mutating caller-owned arrays or product objects. Several methods explicitly clone (`[...products]`, `{ ...product }`) and sorting is non-mutating.
- Review asynchronous workflow changes in `reviewPullRequest.ts` carefully: the non-first-review path reviews only changed lines, marks old issues fixed, and calculates complexity for hard-coded PR number `123`; changing this sequencing or identifier may alter its current behavior.
- The displayed rupee strings in `BuggyProductApp.jsx` contain mojibake (`â‚¹`); preserve or correct encoding consistently rather than introducing a second currency representation.
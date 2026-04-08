# Checkout URL Format — Saved for Future Use

When the app is ready for direct signups, restore these URLs on the pricing page CTA buttons.

## URL Builder Function

```typescript
const APP_URL = import.meta.env.VITE_APP_URL || 'https://app.onramp.com';

function checkoutUrl(plan: string, seats = 1, type: 'individual' | 'shop' = 'individual', buttons?: number) {
  const base = `${APP_URL}/get-started?plan=${plan}&seats=${seats}&type=${type}`;
  return buttons != null ? `${base}&buttons=${buttons}` : base;
}
```

## Individual Technician Examples

```
# Basic plan, 1 seat
https://app.onramp.com/get-started?plan=basic&seats=1&type=individual

# Pro plan, 1 seat  
https://app.onramp.com/get-started?plan=pro&seats=1&type=individual

# Unlimited plan, 1 seat
https://app.onramp.com/get-started?plan=unlimited&seats=1&type=individual
```

## Service Center Examples

```
# Pro plan, 10 techs, 12 brain buttons (10 seats + 2 extras)
https://app.onramp.com/get-started?plan=pro&seats=10&type=shop&buttons=12

# Unlimited plan, 20 techs, 22 brain buttons
https://app.onramp.com/get-started?plan=unlimited&seats=20&type=shop&buttons=22

# Basic plan, 5 techs (minimum), 5 brain buttons
https://app.onramp.com/get-started?plan=basic&seats=5&type=shop&buttons=5
```

## Query Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `plan` | `basic`, `pro`, `unlimited`, `starter_kit`, `sc_starter_kit` | Selected plan |
| `seats` | 1-100 | Number of technician seats |
| `type` | `individual`, `shop` | Individual tech or service center |
| `buttons` | 0-100+ | Number of Brain Buttons (optional, service center only) |

## Where to Restore

In `src/pages/PricingPage.tsx`:

### Individual (currently ~line 1428)
Replace the signup modal `<button>` with:
```tsx
<a href={checkoutUrl(tier.key, 1, 'individual')} target="_blank" rel="noopener noreferrer" className="...">
  {ctaLabels[tier.key]}
</a>
```

### Service Center (currently ~line 2074)
Replace the "Contact Sales" `<button>` with:
```tsx
<a href={checkoutUrl(selectedTier, numTechs, 'shop', totalFlics)} target="_blank" rel="noopener noreferrer" className="...">
  Get Started
</a>
```

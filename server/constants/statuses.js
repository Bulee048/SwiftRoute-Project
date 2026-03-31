export const SHIPMENT_STATUSES = {
  CREATED: 'created',
  ASSIGNED: 'assigned',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  HUB_RECEIVED: 'hub_received',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED_DELIVERY: 'failed_delivery',
  RETURNED: 'returned',
}

export const ORDER_STATUSES = {
  DRAFT: 'draft',
  PLACED: 'placed',
  CONFIRMED: 'confirmed',
  PICKUP_SCHEDULED: 'pickup_scheduled',
  PICKED_UP: 'picked_up',
  IN_TRANSIT: 'in_transit',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
}

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
}

export const MERCHANT_CONTRACT_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
}


import { nanoid } from 'nanoid'

export const generateTrackingId = () => `SWR-${nanoid(10).toUpperCase()}`

export const generateOrderId = () =>
  `ORD-${Date.now().toString(36).toUpperCase()}-${nanoid(4).toUpperCase()}`

export const generatePaymentId = () => `PAY-${nanoid(12).toUpperCase()}`

export const generateEmployeeId = () => `EMP-${nanoid(8).toUpperCase()}`


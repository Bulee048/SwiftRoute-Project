import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import Page from '../../components/common/Page.jsx'
import Button from '../../components/common/Button.jsx'
import { createOrder } from '../../api/orderCreateAPI'
import { getMyMerchantProfile } from '../../api/merchantProfileAPI'

const schema = z.object({
  merchant: z.string().min(1, 'Merchant id is required'),
  customerName: z.string().min(2, 'Customer name required'),
  customerPhone: z.string().min(7, 'Customer phone required'),
  itemName: z.string().min(2, 'Item name required'),
  totalWeight: z.coerce.number().min(0.1, 'Weight must be > 0'),
  pickupCity: z.string().min(2, 'Pickup city required'),
  deliveryCity: z.string().min(2, 'Delivery city required'),
  priority: z.enum(['standard', 'express', 'same_day']),
})

export default function CreateOrder() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [merchantId, setMerchantId] = useState('')
  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'standard' },
  })

  useEffect(() => {
    let mounted = true
    async function run() {
      try {
        const res = await getMyMerchantProfile()
        if (!mounted) return
        const id = res?.data?.merchant?._id
        if (id) {
          setMerchantId(id)
          // Ensure schema validation passes even when the merchant input is disabled.
          setValue('merchant', id, { shouldValidate: true })
        }
      } catch {
        // ignore; fallback to manual merchant id entry
      }
    }
    run()
    return () => {
      mounted = false
    }
  }, [setValue])

  const totalWeightValue = watch('totalWeight')
  const priorityValue = watch('priority')

  const price = useMemo(() => {
    const w = Number(totalWeightValue || 0)
    const p = priorityValue
    const base = 300 + w * 50
    if (p === 'express') return Math.round(base * 1.4)
    if (p === 'same_day') return Math.round(base * 1.8)
    return Math.round(base)
  }, [totalWeightValue, priorityValue])

  const next = async () => {
    const map = {
      1: ['merchant', 'customerName', 'customerPhone'],
      2: ['itemName', 'totalWeight'],
      3: ['pickupCity', 'deliveryCity', 'priority'],
    }
    const ok = await trigger(map[step])
    if (ok) setStep((s) => Math.min(4, s + 1))
  }

  const onSubmit = async (values) => {
    setLoading(true)
    try {
      const payload = {
        merchant: merchantId || values.merchant,
        customer: {
          name: values.customerName,
          phone: values.customerPhone,
          address: { city: values.deliveryCity },
        },
        items: [{ name: values.itemName, quantity: 1, weight: values.totalWeight }],
        packageDetails: { totalWeight: values.totalWeight },
        pickupAddress: { city: values.pickupCity },
        deliveryAddress: { city: values.deliveryCity },
        priority: values.priority,
        amount: { subtotal: price, tax: Math.round(price * 0.1), deliveryCharge: 0, discount: 0, total: Math.round(price * 1.1) },
        status: 'placed',
      }
      await createOrder(payload)
      toast.success('Order created')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page className="sr-card p-6 sm:p-8">
      <div className="font-display text-2xl font-bold text-text-primary">Create Order</div>
      <p className="mt-2 text-text-secondary">Multi-step order form with zod validation and live estimate.</p>

      <div className="mt-4 text-xs font-mono text-text-muted">step {step}/4</div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        {step === 1 && (
          <>
            <input
              {...register('merchant')}
              defaultValue={merchantId || ''}
              placeholder="Merchant ID"
              disabled={!!merchantId}
              className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5 disabled:opacity-70"
            />
            {errors.merchant && <p className="text-xs text-brand-danger">{errors.merchant.message}</p>}
            <input {...register('customerName')} placeholder="Customer Name" className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5" />
            <input {...register('customerPhone')} placeholder="Customer Phone" className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5" />
          </>
        )}

        {step === 2 && (
          <>
            <input {...register('itemName')} placeholder="Item Name" className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5" />
            <input {...register('totalWeight')} placeholder="Total Weight (kg)" type="number" step="0.1" className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5" />
          </>
        )}

        {step === 3 && (
          <>
            <input {...register('pickupCity')} placeholder="Pickup City" className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5" />
            <input {...register('deliveryCity')} placeholder="Delivery City" className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5" />
            <select {...register('priority')} className="w-full rounded-xl border border-dark-border bg-dark-elevated/50 px-3 py-2.5">
              <option value="standard">standard</option>
              <option value="express">express</option>
              <option value="same_day">same_day</option>
            </select>
          </>
        )}

        {step === 4 && (
          <div className="rounded-xl border border-dark-border p-4">
            <div className="text-sm text-text-secondary">Estimated base: LKR {price}</div>
            <div className="text-sm text-text-secondary">Estimated total (with tax): LKR {Math.round(price * 1.1)}</div>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < 4 ? (
            <Button type="button" onClick={next}>Next</Button>
          ) : (
            <Button type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Submit Order'}</Button>
          )}
        </div>
      </form>
    </Page>
  )
}


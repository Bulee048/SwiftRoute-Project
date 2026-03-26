import { useEffect, useState } from 'react'
import { DollarSign, Package, Truck, Users } from 'lucide-react'
import StatCard from '../../components/dashboard/StatCard.jsx'
import Page from '../../components/common/Page.jsx'
import useSocket from '../../hooks/useSocket'
import AdminDriversMap from '../../components/maps/AdminDriversMap.jsx'

export default function AdminDashboard() {
  const socket = useSocket()
  const [events, setEvents] = useState([])
  const [drivers, setDrivers] = useState([])

  useEffect(() => {
    if (!socket) return
    const onShipment = (data) => {
      setEvents((prev) => [{ type: 'shipment_update', at: new Date().toISOString(), data }, ...prev].slice(0, 5))
    }
    const onDriverLoc = (data) => {
      if (!data?.driverId) return
      setDrivers((prev) => {
        const existsIdx = prev.findIndex((d) => String(d.driverId) === String(data.driverId))
        const next = [...prev]
        const payload = { driverId: data.driverId, lat: data.lat, lng: data.lng }
        if (existsIdx >= 0) next[existsIdx] = { ...next[existsIdx], ...payload }
        else next.unshift({ ...payload })
        return next.slice(0, 30)
      })
      setEvents((prev) => [{ type: 'driver_location', at: new Date().toISOString(), data }, ...prev].slice(0, 5))
    }
    socket.on('shipment_update', onShipment)
    socket.on('driver_location_broadcast', onDriverLoc)
    return () => {
      socket.off('shipment_update', onShipment)
      socket.off('driver_location_broadcast', onDriverLoc)
    }
  }, [socket])

  return (
    <Page className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="font-display text-3xl font-bold text-text-primary">Admin Dashboard</div>
          <div className="mt-1 text-sm text-text-secondary">
            Command-center overview (demo data for now).
          </div>
        </div>
        <div className="sr-chip border-dark-border bg-dark-elevated/40 text-text-secondary font-mono">
          live: {socket ? 'on' : 'off'}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Total Orders (today)" value="128" change="+12.4%" changeType="up" icon={Package} color="#0EA5E9" />
        <StatCard title="Active Shipments" value="43" change="-3.1%" changeType="down" icon={Truck} color="#F97316" />
        <StatCard title="Revenue (month)" value="LKR 2.4M" change="+8.7%" changeType="up" icon={DollarSign} color="#22C55E" />
        <StatCard title="Active Drivers" value="19" change="+2" changeType="up" icon={Users} color="#A855F7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 sr-card p-5">
          <div className="font-display text-lg font-semibold text-text-primary">Revenue</div>
          <div className="mt-4 h-56 rounded-2xl border border-dark-border bg-dark-base/60 grid place-items-center text-text-muted">
            Chart placeholder (Recharts comes next)
          </div>
        </div>
        <div className="sr-card p-5 space-y-4">
          <div className="font-display text-lg font-semibold text-text-primary">Live Drivers Map</div>
          <AdminDriversMap drivers={drivers} />

          <div>
            <div className="font-display text-lg font-semibold text-text-primary">Live Feed</div>
            <div className="mt-4 space-y-3 text-sm text-text-secondary">
              {events.length === 0 ? (
                <>
                  <div className="sr-card p-4">Waiting for socket events...</div>
                  <div className="sr-card p-4">driver_location_broadcast and shipment_update will appear here.</div>
                </>
              ) : (
                events.map((e, i) => (
                  <div key={`${e.type}-${i}`} className="sr-card p-4">
                    <div className="font-mono text-xs text-text-muted">{e.type}</div>
                    <div className="mt-1 font-mono text-xs break-all">{JSON.stringify(e.data)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </Page>
  )
}


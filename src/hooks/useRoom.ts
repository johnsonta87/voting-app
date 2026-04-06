import { useEffect, useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export function useRoom() {
  // for hydration for client side subscription
  const [isClient, setIsClient] = useState(false)
  const [voterName, setVoterName] = useState('')
  const [roomId, setRoomId] = useState<Id<'rooms'> | null>(null)
  const getOrCreateRoom = useMutation(api.voting.getOrCreateRoom)

  useEffect(() => {
    setIsClient(true)
    const savedName = localStorage.getItem('voterName') ?? ''
    setVoterName(savedName)
    const savedRoomId = localStorage.getItem('roomId')
    if (savedRoomId) setRoomId(savedRoomId as Id<'rooms'>)
    getOrCreateRoom({}).then((id) => {
      setRoomId(id)
      localStorage.setItem('roomId', id)
    })
  }, [getOrCreateRoom])

  return { isClient, voterName, setVoterName, roomId, setRoomId }
}

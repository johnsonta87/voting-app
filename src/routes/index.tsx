import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import EntryScreen from '~/components/EntryScreen.tsx'
import Header from '~/components/Header.tsx'
import Participants from '~/components/Participants.tsx'
import AverageEstimate from '~/components/AverageEstimate.tsx'
import VotingCards from '~/components/VotingCards.tsx'
import TicketBanner from '~/components/TicketBanner.tsx'

export const Route = createFileRoute('/')({
  component: Home,
})

const STORY_POINTS = ['1', '2', '3', '5', '8', '13', '21', '?', '☕']

function Home() {
  const [isClient, setIsClient] = useState(false)
  const [voterName, setVoterName] = useState('')
  const [nameInput, setNameInput] = useState('')
  const [roomId, setRoomId] = useState<Id<'rooms'> | null>(null)
  const [showNewRound, setShowNewRound] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showClearVotesConfirm, setShowClearVotesConfirm] = useState(false)
  const [newTicketInput, setNewTicketInput] = useState('')
  const [editingTicket, setEditingTicket] = useState(false)
  const [ticketDraft, setTicketDraft] = useState('')
  const newRoundRef = useRef<HTMLInputElement>(null)

  const getOrCreateRoom = useMutation(api.voting.getOrCreateRoom)
  const submitVoteMut = useMutation(api.voting.submitVote)
  const revealVotesMut = useMutation(api.voting.revealVotes)
  const resetRoomMut = useMutation(api.voting.resetRoom)
  const clearRoomMut = useMutation(api.voting.clearRoom)
  const updateTicketMut = useMutation(api.voting.updateTicketName)

  // Real-time room data — "skip" until we have both roomId and voterName
  const roomData = useQuery(
    api.voting.getVotes,
    roomId && voterName ? { roomId, voterName } : 'skip',
  )

  // Hydrate state from localStorage after first render
  useEffect(() => {
    setIsClient(true)
    const savedName = localStorage.getItem('voterName') ?? ''
    setVoterName(savedName)

    const savedRoomId = localStorage.getItem('roomId')
    if (savedRoomId) setRoomId(savedRoomId as Id<'rooms'>)

    // Always ensure a room exists
    getOrCreateRoom({}).then((id) => {
      setRoomId(id)
      localStorage.setItem('roomId', id)
    })
  }, [getOrCreateRoom])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleJoin = () => {
    const name = nameInput.trim()
    if (!name) return
    setVoterName(name)
    localStorage.setItem('voterName', name)
  }

  const handleChangeName = () => {
    setVoterName('')
    localStorage.removeItem('voterName')
    setNameInput('')
  }

  const handleVote = (point: string) => {
    if (!roomId || !voterName || roomData?.revealed) return
    void submitVoteMut({ roomId, voterName, value: point })
  }

  const handleReveal = () => {
    if (!roomId) return
    void revealVotesMut({ roomId })
  }

  const handleNewRound = () => {
    if (!roomId) return
    const ticketName = newTicketInput.trim() || 'New Ticket'
    void resetRoomMut({ roomId, ticketName })
    setNewTicketInput('')
    setShowNewRound(false)
  }

  const handleSaveTicket = () => {
    if (!roomId || !ticketDraft.trim()) return
    void updateTicketMut({ roomId, ticketName: ticketDraft.trim() })
    setEditingTicket(false)
  }

  const handleClearRoom = () => {
    if (!roomId) return
    // Prevent clearing if already in initial state (no votes, no ticket name)
    const isInitialState =
      (roomData?.votes.filter((v) => v.hasVoted).length ?? 0) === 0 &&
      (roomData?.ticketName.trim().length ?? 0) === 0
    if (isInitialState) {
      setShowClearConfirm(false)
      setShowNewRound(false)
      setEditingTicket(false)
      return
    }
    void clearRoomMut({ roomId })
    setShowClearConfirm(false)
    setShowNewRound(false)
    setEditingTicket(false)
  }

  const handleClearVotes = () => {
    if (!roomId || !roomData) return
    void resetRoomMut({ roomId, ticketName: roomData.ticketName || 'New Ticket' })
    setShowClearVotesConfirm(false)
    setShowNewRound(false)
  }

  // ── Derived state ─────────────────────────────────────────────────────────

  const myVote = roomData?.votes.find((v) => v.voterName === voterName)
  const mySelectedValue = myVote?.value ?? null
  const votedCount = roomData?.votes.filter((v) => v.hasVoted).length ?? 0

  const numericVotes = roomData?.revealed
    ? roomData.votes
        .filter((v) => v.value !== null && v.value !== undefined && !Number.isNaN(Number(v.value)))
        .map((v) => Number(v.value))
    : []
  const average =
    numericVotes.length > 0
      ? (numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length).toFixed(1)
      : null

  const iAmInList = roomData?.votes.some((v) => v.voterName === voterName) ?? false
  const disableResetRoom =
    votedCount === 0 && (roomData?.ticketName.trim().length ?? 0) === 0

  const statusText = (() => {
    if (!roomData) return '…'
    if (roomData.revealed) return '🔓 Votes revealed'
    if (votedCount === 0) return 'Waiting for votes…'
    const plural = votedCount === 1 ? 'vote' : 'votes'
    return `${votedCount} ${plural} cast · hidden until revealed`
  })()

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-100 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <p className="animate-pulse">Loading…</p>
      </div>
    )
  }

  // ── Name entry screen ─────────────────────────────────────────────────────

  if (!voterName) {
    return (
      <EntryScreen
        nameInput={nameInput}
        onNameInputChange={setNameInput}
        onJoin={handleJoin}
      />
    )
  }

  // ── Main voting room ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-800">
      <Header voterName={voterName} onChangeName={handleChangeName} />

      <main className="max-w-3xl mx-auto px-5 py-6 flex flex-col gap-5">
        <TicketBanner
          roomData={roomData}
          editingTicket={editingTicket}
          ticketDraft={ticketDraft}
          setTicketDraft={setTicketDraft}
          handleSaveTicket={handleSaveTicket}
          setEditingTicket={setEditingTicket}
          statusText={statusText}
        />

        <VotingCards
          storyPoints={STORY_POINTS}
          mySelectedValue={mySelectedValue}
          handleVote={handleVote}
          revealed={roomData?.revealed}
        />

        <AverageEstimate average={roomData?.revealed ? average : null} />

        <Participants
          votes={roomData?.votes}
          voterName={voterName}
          revealed={roomData?.revealed ?? false}
          iAmInList={iAmInList}
        />

        {/* ── Action bar ── */}
        <div className="flex flex-col gap-3">
          {!roomData?.revealed && (
            <button
              onClick={handleReveal}
              disabled={votedCount === 0}
              className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-base"
            >
              👀 Reveal Votes
            </button>
          )}

          {roomData?.revealed && !showNewRound && (
            <button
              onClick={() => {
                setShowNewRound(true)
                setTimeout(() => newRoundRef.current?.focus(), 50)
              }}
              className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-base"
            >
              Start New Round
            </button>
          )}

          {showNewRound && (
            <div className="flex gap-2">
              <input
                ref={newRoundRef}
                type="text"
                value={newTicketInput}
                onChange={(e) => setNewTicketInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNewRound()
                  if (e.key === 'Escape') setShowNewRound(false)
                }}
                placeholder="Next ticket name (optional)"
                className="flex-1 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 dark:bg-gray-700 text-white"
              />
              <button
                onClick={handleNewRound}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                Start
              </button>
              <button
                onClick={() => setShowNewRound(false)}
                className="bg-gray-100 cursor-pointer hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold px-4 py-3 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Clear/Reset actions ── */}
          {!roomData?.revealed && roomData && !showClearVotesConfirm && !showClearConfirm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setShowClearVotesConfirm(true)}
                disabled={votedCount === 0}
                className="w-full border-2 cursor-pointer border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                🧹 Clear Votes
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={disableResetRoom}
                className="w-full border-2 cursor-pointer border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                🔄 Reset Room
              </button>
            </div>
          )}

          {/* Hide confirm dialogs if votes are revealed */}
          {!roomData?.revealed && showClearVotesConfirm && (
            <div className="border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col gap-3 bg-amber-50 dark:bg-amber-900/10">
              <p className="text-sm text-amber-700 dark:text-amber-300 font-medium text-center">
                Clear all votes for everyone? The ticket name will stay.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearVotes}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Yes, clear votes
                </button>
                <button
                  onClick={() => setShowClearVotesConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!roomData?.revealed && showClearConfirm && (
            <div className="border-2 border-red-200 dark:border-red-800 rounded-xl p-4 flex flex-col gap-3 bg-red-50 dark:bg-red-900/10">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium text-center">
                Remove all votes and the ticket name for everyone?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleClearRoom}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Yes, clear it
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2.5 rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Home

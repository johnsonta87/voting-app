import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'

export const Route = createFileRoute('/')({
  component: Home,
})

const STORY_POINTS = ['1', '2', '3', '5', '8', '13', '21', '?', '☕']

function Home() {
  // SSR-safe: keep everything empty until after mount
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

    // Always ensure a room exists (idempotent)
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

  // ── Loading / SSR skeleton ────────────────────────────────────────────────

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🃏</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">OCC Planning Poker</h1>
            <p className="text-white text-sm mt-1">
              Enter your name to join the session
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Your name"
              className="border-2 text-center border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              autoFocus
            />
            <button
              onClick={handleJoin}
              disabled={!nameInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Join Session
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main voting room ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-800">
      {/* ── Header ── */}
      <header className="bg-white dark:bg-[#00203e] border-b border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 py-3 flex items-center justify-between">
          <span className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
            🃏 <span>OCC Planning Poker</span>
          </span>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white">Voting as</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {voterName}
            </span>
            <button
              onClick={handleChangeName}
              className="text-xs text-blue-500 hover:text-blue-700 dark:hover:text-blue-300 underline ml-1"
            >
              change
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-6 flex flex-col gap-5">
        {/* ── Ticket banner ── */}
        <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          {editingTicket ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={ticketDraft}
                onChange={(e) => setTicketDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTicket()
                  if (e.key === 'Escape') setEditingTicket(false)
                }}
                className="flex-1 border-2 border-blue-400 rounded-lg px-3 py-2 text-base focus:outline-none dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <button
                onClick={handleSaveTicket}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTicket(false)}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="group flex items-start gap-2 w-full text-left"
              onClick={() => {
                if (roomData && !roomData.revealed) {
                  setTicketDraft(roomData.ticketName)
                  setEditingTicket(true)
                }
              }}
            >
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider mb-1">
                  Currently voting on (optional):
                </p>
                <h2 className="text-xl font-bold ">
                  {roomData?.ticketName || (
                      <span className="text-gray-400 dark:text-gray-500 font-normal italic">
                      No ticket — click to set one
                    </span>
                  )}
                </h2>
              </div>
            </button>
          )}

          <p className="text-xs mt-2">{statusText}</p>
        </div>

        {/* ── Voting cards ── */}
        {!roomData?.revealed && (
          <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
            <p className="text-xs font-medium uppercase tracking-wider mb-4">
              Pick a card to vote
            </p>
            <div className="grid grid-cols-9 gap-2">
              {STORY_POINTS.map((point) => {
                const selected = mySelectedValue === point
                return (
                  <button
                    key={point}
                    onClick={() => handleVote(point)}
                    className={[
                      'aspect-2/3 flex items-center justify-center rounded-xl text-base font-bold cursor-pointer',
                      'border-2 transition-all duration-150 select-none',
                      'hover:-translate-y-1 hover:shadow-md active:scale-95',
                      selected
                        ? 'border-blue-500 bg-blue-500 text-white shadow-lg -translate-y-1'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-blue-400',
                    ].join(' ')}
                  >
                    {point}
                  </button>
                )
              })}
            </div>
            {mySelectedValue && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-3 font-medium text-center">
                You selected <strong>{mySelectedValue}</strong> · tap another
                card to change
              </p>
            )}
          </div>
        )}

        {/* ── Results card (after reveal) ── */}
        {roomData?.revealed && average && (
          <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wider mb-2">
              Average estimate
            </p>
            <p className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">
              {average}
            </p>
            <p className="text-xs mt-1">story points</p>
          </div>
        )}

        {/* ── Participants ── */}
        <div className="bg-white dark:bg-[#00203e] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <p className="text-xs font-medium uppercase tracking-wider mb-4">
            Participants
          </p>
          <div className="flex flex-col gap-2">
            {/* Voters from DB */}
            {roomData?.votes.map((vote) => (
              <ParticipantRow
                key={vote.voterName}
                name={vote.voterName}
                isMe={vote.voterName === voterName}
                hasVoted={vote.hasVoted}
                value={vote.value ?? null}
                revealed={roomData.revealed}
              />
            ))}

            {/* Current user if not yet in the list */}
            {!iAmInList && roomData && (
              <ParticipantRow
                name={voterName}
                isMe={true}
                hasVoted={false}
                value={null}
                revealed={roomData.revealed}
              />
            )}

            {!roomData && (
              <p className="text-sm animate-pulse">Connecting…</p>
            )}
          </div>
        </div>

        {/* ── Action bar ── */}
        <div className="flex flex-col gap-3">
          {!roomData?.revealed && (
            <button
              onClick={handleReveal}
              disabled={votedCount === 0}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-base"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-base"
            >
              🔄 Start New Round
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
                className="flex-1 border-2 border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleNewRound}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                Start
              </button>
              <button
                onClick={() => setShowNewRound(false)}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold px-4 py-3 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* ── Clear/Reset actions ── */}
          {roomData && !showClearVotesConfirm && !showClearConfirm && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => setShowClearVotesConfirm(true)}
                disabled={votedCount === 0}
                className="w-full border-2 border-amber-200 dark:border-amber-900 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                🧹 Clear Votes
              </button>

              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={disableResetRoom}
                className="w-full border-2 border-red-200 dark:border-red-900 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-2.5 rounded-xl transition-colors text-sm"
              >
                🗑 Reset Room
              </button>
            </div>
          )}

          {showClearVotesConfirm && (
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


          {showClearConfirm && (
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

// ── Sub-components ────────────────────────────────────────────────────────────

function ParticipantRow({
  name,
  isMe,
  hasVoted,
  value,
  revealed,
}: Readonly<{
  name: string
  isMe: boolean
  hasVoted: boolean
  value: string | null
  revealed: boolean
}>) {
  const voteDisplay = (() => {
    if (!revealed) {
      return hasVoted ? (
        <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-1">
          ✅ Voted
        </span>
      ) : (
        <span className="text-amber-500 dark:text-amber-400 text-sm font-medium flex items-center gap-1">
          ⏳ Thinking…
        </span>
      )
    }
    if (value !== null) {
      return (
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-bold text-base shadow-sm">
          {value}
        </span>
      )
    }
    return <span className="text-xs">—</span>
  })()
  return (
    <div
      className={[
        'flex items-center justify-between px-4 py-3 rounded-xl',
        isMe
          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800'
          : 'bg-gray-50 dark:bg-gray-700/40',
      ].join(' ')}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">👤</span>
        <span
          className={[
            'font-medium text-sm',
            isMe
              ? 'text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300',
          ].join(' ')}
        >
          {name}
          {isMe && ' (you)'}
        </span>
      </div>

      <div>
        {voteDisplay}
      </div>
    </div>
  )
}

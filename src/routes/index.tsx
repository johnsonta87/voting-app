import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import type { Id } from '../../convex/_generated/dataModel'
import EntryScreen from '~/components/EntryScreen.tsx'
import Header from '~/components/Header.tsx'
import Participants from '~/components/Participants.tsx'
import AverageEstimate from '~/components/AverageEstimate.tsx'
import VotingCards from '~/components/VotingCards.tsx'
import StatusBanner from '~/components/StatusBanner.tsx'
import { useRoom } from '~/hooks/useRoom.ts'

export const Route = createFileRoute('/')({
  component: Home,
})

const STORY_POINTS = ['1', '2', '3', '5', '8', '13', '21', '?', '☕']

function Home() {
  const { isClient, voterName, setVoterName, roomId, setRoomId } = useRoom();
  const [nameInput, setNameInput] = useState('')
  const [_, setShowNewRound] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showClearVotesConfirm, setShowClearVotesConfirm] = useState(false)

  const getOrCreateRoom = useMutation(api.voting.getOrCreateRoom)
  const submitVoteMutation = useMutation(api.voting.submitVote)
  const revealVotesMutation = useMutation(api.voting.revealVotes)
  const resetRoomMutation = useMutation(api.voting.resetRoom)
  const clearRoomMutation = useMutation(api.voting.clearRoom)

  // Real-time room data — "skip" until we have both roomId and voterName
  const roomData = useQuery(
    api.voting.getVotes,
    roomId && voterName ? { roomId, voterName } : 'skip',
  )

  // Remove destructure from useVote, use only the derived state below
  // const { myVote, mySelectedValue, votedCount } = useVote(roomData, voterName)

  // Hydrate state from localStorage after first render
  useEffect(() => {
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
    void submitVoteMutation({ roomId, voterName, value: point })
  }

  const handleReveal = () => {
    if (!roomId) return
    void revealVotesMutation({ roomId })
  }

  const handleNewRound = () => {
    if (!roomId) return
    void resetRoomMutation({ roomId })
    setShowNewRound(false)
  }

  const handleClearRoom = () => {
    if (!roomId) return
    // Prevent clearing if already in initial state (no votes)
    const isInitialState =
      (roomData?.votes.filter((v) => v.hasVoted).length ?? 0) === 0
    if (isInitialState) {
      setShowClearConfirm(false)
      setShowNewRound(false)
      return
    }
    void clearRoomMutation({ roomId })
    setShowClearConfirm(false)
    setShowNewRound(false)
  }

  const handleClearVotes = () => {
    if (!roomId || !roomData) return
    void resetRoomMutation({ roomId })
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

  const statusText = (() => {
    if (!roomData) return '…'
    if (roomData.revealed) return 'Estimates revealed'
    if (votedCount === 0) return 'Waiting for estimates…'
    return `${votedCount} voted · hidden until revealed`
  })()

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="animate-pulse">Loading…</p>
      </div>
    )
  }

  if (!voterName) {
    return (
      <EntryScreen
        nameInput={nameInput}
        onNameInputChange={setNameInput}
        onJoin={handleJoin}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <Header voterName={voterName} onChangeName={handleChangeName} />

      <main className="max-w-3xl mx-auto px-5 py-6 flex flex-col gap-5">
        <StatusBanner statusText={statusText} />

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
              className={`w-full cursor-pointer bg-[#00aaa6] hover:bg-[#017f7c] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-base`}
            >
              👀 Reveal Votes
            </button>
          )}

          {roomData?.revealed && (
            <div className="flex gap-2">
              <button
                onClick={handleNewRound}
                className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors flex-1"
              >
                Start New Round
              </button>
            </div>
          )}

          {/* ── Clear/Reset actions ── */}
          {!roomData?.revealed &&
            roomData &&
            !showClearVotesConfirm &&
            !showClearConfirm && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowClearVotesConfirm(true)}
                  disabled={votedCount === 0}
                  className="w-full border-2 cursor-pointer border-amber-200 dark:border-amber-900 bg-orange-900 hover:bg-orange-400 dark:hover:bg-amber-900/90 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-2.5 rounded-xl transition-colors text-sm"
                >
                  🧹 Clear
                </button>
              </div>
            )}

          {/* Hide confirm dialogs if votes are revealed */}
          {!roomData?.revealed && showClearVotesConfirm && (
            <div className="border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 flex flex-col gap-3 bg-amber-50 dark:bg-amber-900">
              <p className="text-sm font-medium text-center">
                Clear all votes for everyone?
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
                Remove all votes for everyone?
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

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
import PokerTable from '~/components/PokerTable.tsx'
import ConfirmDialog from '~/components/ConfirmDialog.tsx'
import { useRoom } from '~/hooks/useRoom.ts'
import { useTheme } from '~/hooks/useTheme.ts'
import Footer from '~/components/Footer.tsx'

export const Route = createFileRoute('/')({
  component: Home,
})

const STORY_POINTS = ['1', '2', '3', '5', '8', '13', '21', '?', '☕']

function Home() {
  const { isClient, voterName, setVoterName, roomId, setRoomId } = useRoom();
  const { theme, toggleTheme } = useTheme()
  const [nameInput, setNameInput] = useState('')
  const [_, setShowNewRound] = useState(false)
  const [showClearVotesDialog, setShowClearVotesDialog] = useState(false)

  const getOrCreateRoom = useMutation(api.voting.getOrCreateRoom)
  const submitVoteMutation = useMutation(api.voting.submitVote)
  const revealVotesMutation = useMutation(api.voting.revealVotes)
  const resetRoomMutation = useMutation(api.voting.resetRoom)

  // realtime - "skip" until we have both roomId and voterName
  const roomData = useQuery(
    api.voting.getVotes,
    roomId && voterName ? { roomId, voterName } : 'skip',
  )

  useEffect(() => {
    const savedName = localStorage.getItem('voterName') ?? ''
    setVoterName(savedName)

    const savedRoomId = localStorage.getItem('roomId')
    if (savedRoomId) setRoomId(savedRoomId as Id<'rooms'>)

    // always ensure a room exists
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

  const handleClearVotes = () => {
    if (!roomId || !roomData) return
    void resetRoomMutation({ roomId })
    setShowClearVotesDialog(false)
    setShowNewRound(false)
  }

  // ── Derived state ─────────────────────────────────────────────────────────
  const myVote = roomData?.votes.find((v) => v.voterName === voterName)
  const mySelectedValue = myVote?.value ?? null
  const votedCount = roomData?.votes.filter((v) => v.hasVoted).length ?? 0

  const numericVotes = roomData?.revealed
    ? roomData.votes
        .filter((v) => v.value && !Number.isNaN(Number(v.value)))
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
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        voterName={voterName}
        onChangeName={handleChangeName}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-7xl mx-auto px-5 py-6 flex flex-col gap-5">
        <h1 className="text-[#00aaa6] text-3xl font-bold tracking-tighter md:text-5xl mb-2">
          Team Planning Poker
        </h1>
        <p className="text-muted-foreground w-full text-sm font-normal md:px-0">
          Pick a card to estimate the story, wait for everyone to vote, then
          reveal and discuss the results to align on a final estimate.
        </p>
        <VotingCards
          storyPoints={STORY_POINTS}
          mySelectedValue={mySelectedValue}
          handleVote={handleVote}
          revealed={roomData?.revealed}
        />

        <AverageEstimate average={roomData?.revealed ? average : null} />

        <PokerTable statusText={statusText} />

        <Participants
          votes={roomData?.votes}
          voterName={voterName}
          revealed={roomData?.revealed ?? false}
          iAmInList={iAmInList}
        />

        {/* ── Action bar ── */}
        <div className="flex flex-col gap-3">
          {!roomData?.revealed && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={handleReveal}
                disabled={votedCount === 0}
                className="w-full sm:max-w-62.5 cursor-pointer bg-[#00aaa6] hover:bg-[#017f7c] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md transition-colors text-base"
              >
                Reveal Votes
              </button>

              {!showClearVotesDialog && roomData && (
                <button
                  onClick={() => setShowClearVotesDialog(true)}
                  disabled={votedCount === 0}
                  className="w-full sm:max-w-62.5 border border-black dark:border-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-3 rounded-md transition-colors text-base"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {roomData?.revealed && (
            <div className="flex justify-center gap-2">
              <button
                onClick={handleNewRound}
                className="w-full sm:max-w-62.5 bg-[#00aaa6] cursor-pointer text-white font-semibold px-5 py-3 rounded-md transition-colors flex-1"
              >
                Start New Round
              </button>
            </div>
          )}
        </div>

        <ConfirmDialog
          cancelLabel="Cancel"
          confirmLabel="Yes, clear votes"
          description="This removes every current vote in the room and starts the round over for everyone."
          onCancel={() => setShowClearVotesDialog(false)}
          onConfirm={handleClearVotes}
          open={!roomData?.revealed && showClearVotesDialog}
          title="Clear all votes?"
        />
      </main>

      <Footer />
    </div>
  )
}

export default Home

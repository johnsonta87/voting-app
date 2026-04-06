type RoomDate =
  | {
      revealed: boolean
      votes: Array<{
        voterName: string
        value?: string | null
        hasVoted: boolean
      }>
    }
  | null
  | undefined

export function useVote(roomData: RoomDate, voterName: string) {
  const myVote = roomData?.votes.find((v) => v.voterName === voterName)
  const mySelectedValue = myVote?.value ?? null
  const votedCount = roomData?.votes.filter((v) => v.hasVoted).length ?? 0

  return { myVote, mySelectedValue, votedCount }
}

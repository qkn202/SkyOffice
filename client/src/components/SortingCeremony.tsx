import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../hooks'
import { setAssignedHouse } from '../stores/UserStore'
import { closeSortingCeremony, openSortingCeremony } from '../stores/SortingStore'
import { getHouseBadge } from '../utils/houseBadge'
import { House, HOUSES } from '../utils/houseOutfits'
import phaserGame from '../PhaserGame'
import type Game from '../scenes/Game'

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 500;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(9, 7, 20, 0.7);
  backdrop-filter: blur(5px);
`

const HousePill = styled.div<{ $color: string }>`
  position: fixed;
  z-index: 120;
  top: 14px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 13px;
  border: 1px solid ${({ $color }) => `${$color}99`};
  border-radius: 999px;
  color: #fff;
  background: rgba(15, 18, 29, 0.86);
  box-shadow: 0 4px 16px #0007;
  font-size: 13px;
  font-weight: 700;
`

const Prompt = styled.button`
  position: fixed;
  z-index: 130;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  border: 1px solid #e7c875;
  border-radius: 999px;
  padding: 11px 18px;
  background: rgba(22, 18, 30, 0.94);
  color: #f5dda1;
  box-shadow: 0 6px 24px #0009;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  &:hover { background: #3a2b3d; }

  @media (max-width: 650px) {
    box-sizing: border-box;
    width: calc(100vw - 32px);
    bottom: 190px;
    padding: 10px 14px;
    white-space: normal;
    text-align: center;
    line-height: 1.35;
  }
`

const Card = styled.div<{ $color?: string }>`
  width: min(560px, 100%);
  padding: 28px;
  color: #f7f1e5;
  background: linear-gradient(155deg, #21182b, #101522 70%);
  border: 1px solid ${({ $color }) => `${$color || '#d5b36b'}88`};
  border-radius: 18px;
  box-shadow: 0 18px 70px #000a, 0 0 34px ${({ $color }) => `${$color || '#d5b36b'}22`};
  text-align: center;

  h1 { margin: 8px 0 12px; color: #f2d28a; font-size: clamp(22px, 5vw, 30px); }
  p { color: #c8c4d2; line-height: 1.55; margin: 8px 0 18px; }
  @media (max-width: 540px) { padding: 22px 18px; }
`

const Hat = styled.div`
  font-size: 56px;
  line-height: 1;
  filter: drop-shadow(0 0 18px rgba(237, 195, 103, 0.35));
`

const Answers = styled.div`
  display: grid;
  gap: 10px;
  margin-top: 20px;
  text-align: left;
`

const Answer = styled.button`
  width: 100%;
  border: 1px solid #ffffff22;
  border-radius: 10px;
  padding: 13px 15px;
  background: #ffffff0b;
  color: #f4efe5;
  font: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
  &:hover, &:focus-visible { background: #d5b36b22; border-color: #d5b36b99; transform: translateY(-1px); outline: none; }
`

const Primary = styled.button<{ $color?: string }>`
  border: 0;
  border-radius: 999px;
  padding: 12px 24px;
  background: ${({ $color }) => $color || 'linear-gradient(135deg, #a47630, #e1bf70)'};
  color: #1a1420;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  &:hover { filter: brightness(1.08); }
`

const Progress = styled.div`
  width: 100%;
  height: 5px;
  border-radius: 5px;
  margin: 18px 0 24px;
  background: #ffffff18;
  overflow: hidden;
  span { display: block; height: 100%; background: #d6b86e; transition: width 180ms ease; }
`

type Choice = { text: string; house: House }
type Question = { prompt: string; choices: Choice[] }

const questions: Question[] = [
  {
    prompt: 'Một sinh viên năm nhất lạc đường và sắp muộn giờ. Bạn sẽ…',
    choices: [
      { text: 'Dẫn bạn ấy đi ngay, dù mình phải chạy thật nhanh.', house: 'GRYFFINDOR' },
      { text: 'Tìm lối tắt hợp lý nhất qua lâu đài.', house: 'RAVENCLAW' },
      { text: 'Hỏi thêm để biết bạn ấy thực sự cần gì rồi mới quyết định.', house: 'SLYTHERIN' },
      { text: 'Đi cùng bạn ấy để bạn không phải loay hoay một mình.', house: 'HUFFLEPUFF' },
    ],
  },
  {
    prompt: 'Trong một cuộc thi phép thuật, điều gì khiến bạn tự hào nhất?',
    choices: [
      { text: 'Dám đứng ra khi mọi người còn do dự.', house: 'GRYFFINDOR' },
      { text: 'Tìm ra lời giải mà chưa ai nghĩ tới.', house: 'RAVENCLAW' },
      { text: 'Biết biến mục tiêu khó thành một kế hoạch thắng lợi.', house: 'SLYTHERIN' },
      { text: 'Cùng cả nhóm tiến tới đích và không bỏ ai lại.', house: 'HUFFLEPUFF' },
    ],
  },
  {
    prompt: 'Chiếc Nón cảm nhận phẩm chất bạn muốn rèn luyện nhất là…',
    choices: [
      { text: 'Lòng can đảm để bảo vệ điều đúng.', house: 'GRYFFINDOR' },
      { text: 'Tri thức để hiểu thế giới sâu hơn.', house: 'RAVENCLAW' },
      { text: 'Tham vọng để tự quyết định tương lai.', house: 'SLYTHERIN' },
      { text: 'Lòng trung thành để mọi người có thể tin cậy.', house: 'HUFFLEPUFF' },
    ],
  },
]

function getStorageKey(username: string) {
  return `skyoffice_sorting_${username.trim().toLowerCase() || 'guest'}`
}

export default function SortingCeremony() {
  const dispatch = useAppDispatch()
  const loggedIn = useAppSelector((state) => state.user.loggedIn)
  const profile = useAppSelector((state) => state.user.hpvnProfile)
  const assignedHouse = useAppSelector((state) => state.user.assignedHouse)
  const nearHat = useAppSelector((state) => state.sorting.nearHat)
  const ceremonyOpen = useAppSelector((state) => state.sorting.ceremonyOpen)
  const [questionIndex, setQuestionIndex] = useState(-1)
  const [scores, setScores] = useState<Record<House, number>>({
    GRYFFINDOR: 0,
    SLYTHERIN: 0,
    RAVENCLAW: 0,
    HUFFLEPUFF: 0,
  })
  const [revealedHouse, setRevealedHouse] = useState<House | ''>('')
  const [dismissed, setDismissed] = useState(false)

  const game = useMemo(() => phaserGame.scene.keys.game as Game, [])
  const profileHouse = HOUSES.find((house) => house === profile?.house.toUpperCase())
  const activeHouse = profileHouse || (HOUSES.includes(assignedHouse as House) ? assignedHouse as House : '')

  useEffect(() => {
    if (!loggedIn || profileHouse || assignedHouse) return
    const username = profile?.username || game?.myPlayer?.playerName?.text || 'guest'
    const saved = localStorage.getItem(getStorageKey(username)) as House | null
    if (saved && HOUSES.includes(saved)) {
      dispatch(setAssignedHouse(saved))
      game?.myPlayer?.setHouse(saved, game.network)
    }
  }, [loggedIn, profile, profileHouse, assignedHouse, dispatch, game])

  useEffect(() => {
    if (profileHouse && loggedIn && game?.myPlayer) {
      dispatch(setAssignedHouse(profileHouse))
      game.myPlayer.setHouse(profileHouse, game.network)
    }
  }, [profileHouse, loggedIn, game, dispatch])

  useEffect(() => {
    const open = loggedIn && ceremonyOpen && !dismissed && !profileHouse
    if (!open || !game) return
    game.disableKeys()
    return () => game.enableKeys()
  }, [loggedIn, ceremonyOpen, dismissed, profileHouse, game])

  if (!loggedIn) return null
  if (dismissed) {
    if (!activeHouse) return null
    const badge = getHouseBadge(activeHouse)
    return <HousePill $color={badge.color}>{badge.badge} Nhà {badge.name}</HousePill>
  }

  const start = () => setQuestionIndex(0)
  const choose = (house: House) => {
    const nextScores = { ...scores, [house]: scores[house] + 1 }
    setScores(nextScores)

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1)
      return
    }

    const highestScore = Math.max(...HOUSES.map((candidate) => nextScores[candidate]))
    const contenders = HOUSES.filter((candidate) => nextScores[candidate] === highestScore)
    // A tied reading is settled by the final instinct the student followed.
    const winner = contenders.includes(house) ? house : contenders[0]
    const username = profile?.username || game?.myPlayer?.playerName?.text || 'guest'
    localStorage.setItem(getStorageKey(username), winner)
    dispatch(setAssignedHouse(winner))
    game?.myPlayer?.setHouse(winner, game.network)
    setRevealedHouse(winner)
  }

  if (revealedHouse) {
    const result = getHouseBadge(revealedHouse)
    return (
      <Backdrop>
        <Card $color={result.color}>
          <Hat>{result.badge}</Hat>
          <h1>Nhà {result.name}!</h1>
          <p>
            Chiếc Nón đã quyết định. Áo choàng của bạn đổi màu theo Nhà {result.name}; hãy bước
            xuống Đại Sảnh và bắt đầu hành trình.
          </p>
          <Primary
            $color={result.color}
            onClick={() => {
              dispatch(closeSortingCeremony())
              setDismissed(true)
            }}
          >
            Bước vào Đại Sảnh
          </Primary>
        </Card>
      </Backdrop>
    )
  }

  if (activeHouse) {
    const badge = getHouseBadge(activeHouse)
    return <HousePill $color={badge.color}>{badge.badge} Nhà {badge.name}</HousePill>
  }

  if (!ceremonyOpen) {
    if (!nearHat) return null
    return (
      <Prompt onClick={() => dispatch(openSortingCeremony())}>
        🎩 Đến gần và nhấn T hoặc chạm để đội Chiếc Nón Phân Loại
      </Prompt>
    )
  }

  return (
    <Backdrop>
      <Card>
        <Hat>🎩</Hat>
        {questionIndex < 0 ? (
          <>
            <h1>Chiếc Nón Phân Loại</h1>
            <p>
              Đại Sảnh lặng đi. Chiếc Nón đã sẵn sàng lắng nghe con người bạn — hãy trả lời theo
              điều bạn thật sự coi trọng.
            </p>
            <Primary onClick={start}>Đội Nón Lên</Primary>
          </>
        ) : (
          <>
            <h1>Chiếc Nón đang suy ngẫm…</h1>
            <Progress><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></Progress>
            <p>{questions[questionIndex].prompt}</p>
            <Answers>
              {questions[questionIndex].choices.map((choice) => (
                <Answer key={choice.house} onClick={() => choose(choice.house)}>
                  {choice.text}
                </Answer>
              ))}
            </Answers>
          </>
        )}
      </Card>
    </Backdrop>
  )
}

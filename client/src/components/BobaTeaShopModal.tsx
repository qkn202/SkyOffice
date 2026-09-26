import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import IconButton from '@mui/material/IconButton'
import CloseIcon from '@mui/icons-material/Close'
import LocalCafeIcon from '@mui/icons-material/LocalCafe'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useAppSelector } from '../hooks'
import phaserGame from '../PhaserGame'
import type Game from '../scenes/Game'

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(12px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
`

const floatAnim = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`

const shakeAnim = keyframes`
  0% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(-10deg) scale(1.05); }
  50% { transform: rotate(10deg) scale(1.08); }
  75% { transform: rotate(-8deg) scale(1.04); }
  100% { transform: rotate(0deg) scale(1); }
`

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 6000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(9, 7, 20, 0.78);
  backdrop-filter: blur(8px);
  padding: 16px;
`

const ShopCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 860px;
  max-height: 92vh;
  background: linear-gradient(145deg, #1e130c, #140b07);
  border: 2px solid #e5a93b;
  border-radius: 20px;
  box-shadow: 0 16px 45px rgba(0, 0, 0, 0.75), 0 0 35px rgba(229, 169, 59, 0.25);
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${fadeIn} 0.25s cubic-bezier(0.16, 1, 0.3, 1);
`

const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  background: linear-gradient(90deg, #2c1a0e, #3a2211, #2c1a0e);
  border-bottom: 1.5px solid rgba(229, 169, 59, 0.4);

  .title-group {
    display: flex;
    align-items: center;
    gap: 10px;

    .icon {
      font-size: 26px;
      animation: ${floatAnim} 3s ease-in-out infinite;
    }

    h2 {
      margin: 0;
      font-family: 'Georgia', serif;
      font-size: 19px;
      color: #ffd875;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
      letter-spacing: 0.5px;
    }

    .subtitle {
      font-size: 11px;
      color: #dfba86;
      margin: 0;
    }
  }

  .stats-badges {
    display: flex;
    align-items: center;
    gap: 12px;

    .badge {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(229, 169, 59, 0.35);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      color: #ffeaa7;
    }
  }
`

const TabsRow = styled.div`
  display: flex;
  gap: 8px;
  padding: 10px 20px 0;
  background: #190e08;
  border-bottom: 1px solid rgba(229, 169, 59, 0.2);

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 8px 8px 0 0;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: transparent;
    color: #b59b81;
    transition: all 0.2s ease;

    &.active {
      background: #2b180d;
      color: #ffd875;
      border-top: 2px solid #e5a93b;
      border-left: 1px solid rgba(229, 169, 59, 0.3);
      border-right: 1px solid rgba(229, 169, 59, 0.3);
    }

    &:hover:not(.active) {
      color: #fff;
    }
  }
`

const ContentBody = styled.div`
  padding: 16px 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

// Crafting Station Grid
const CraftingGrid = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;

  @media (max-width: 740px) {
    grid-template-columns: 1fr;
  }
`

const CupPreviewBox = styled.div<{ $shaking: boolean }>`
  background: radial-gradient(circle at center, #2e1a0f 0%, #150a05 100%);
  border: 1px solid rgba(229, 169, 59, 0.3);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 280px;

  .cup-container {
    position: relative;
    width: 100px;
    height: 160px;
    animation: ${(props) => (props.$shaking ? shakeAnim : 'none')} 0.45s ease-in-out infinite;
  }

  .cup-outline {
    position: absolute;
    inset: 0;
    border: 3px solid rgba(255, 255, 255, 0.7);
    border-top: none;
    border-radius: 0 0 20px 20px;
    box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.15);
    overflow: hidden;
  }

  .cup-lid {
    position: absolute;
    top: -12px;
    left: -8px;
    right: -8px;
    height: 14px;
    background: #e5a93b;
    border-radius: 12px 12px 2px 2px;
    border: 1.5px solid #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  }

  .cup-straw {
    position: absolute;
    top: -34px;
    left: 45px;
    width: 10px;
    height: 60px;
    background: repeating-linear-gradient(45deg, #d63031, #d63031 6px, #fff 6px, #fff 12px);
    border-radius: 4px;
    transform: rotate(12deg);
    z-index: 5;
  }

  .tea-liquid {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    transition: all 0.4s ease;
  }

  .topping-layer {
    position: absolute;
    bottom: 6px;
    left: 4px;
    right: 4px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    justify-content: center;
    z-index: 2;
  }

  .cheese-layer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 26px;
    background: #fffdf5;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    z-index: 3;
  }

  .ice-cubes {
    position: absolute;
    top: 35px;
    left: 10px;
    right: 10px;
    display: flex;
    gap: 6px;
    justify-content: center;
    font-size: 16px;
    z-index: 4;
  }
`

const OrderTicketBox = styled.div`
  background: #2b180d;
  border-left: 4px solid #e5a93b;
  border-radius: 0 12px 12px 0;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: center;

  .customer-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 2px solid #ffd875;
    background: #190e08;
    display: grid;
    place-items: center;
    font-size: 26px;
  }

  .order-details {
    flex: 1;

    .customer-name {
      font-weight: 700;
      color: #ffd875;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .order-dialog {
      font-size: 12.5px;
      color: #fff5dc;
      line-height: 1.4;
      font-style: italic;
    }
  }
`

const ControlsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .option-group {
    background: rgba(0, 0, 0, 0.25);
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(229, 169, 59, 0.15);

    .label {
      font-size: 12px;
      color: #dfba86;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  }
`

const SelectButton = styled.button<{ $active?: boolean; $color?: string }>`
  padding: 7px 13px;
  border-radius: 8px;
  border: 1.5px solid ${(props) => (props.$active ? '#ffd875' : 'rgba(255, 255, 255, 0.2)')};
  background: ${(props) => (props.$active ? props.$color || '#8c5322' : 'rgba(255, 255, 255, 0.06)')};
  color: ${(props) => (props.$active ? '#fff' : '#dfba86')};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: #ffd875;
    background: ${(props) => (props.$active ? props.$color || '#8c5322' : 'rgba(255, 255, 255, 0.12)')};
  }
`

const ActionsBar = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 8px;

  button {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-shake {
    background: linear-gradient(135deg, #f39c12, #d35400);
    color: #fff;
    box-shadow: 0 4px 14px rgba(211, 84, 0, 0.4);

    &:hover {
      filter: brightness(1.1);
    }
  }

  .btn-serve {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: #fff;
    box-shadow: 0 4px 14px rgba(39, 174, 96, 0.4);

    &:hover {
      filter: brightness(1.1);
    }
  }

  .btn-clear {
    flex: 0 0 50px;
    background: rgba(255, 255, 255, 0.1);
    color: #ffd875;

    &:hover {
      background: rgba(255, 71, 87, 0.3);
      color: #ff4757;
    }
  }
`

// Menu List Styles
const MenuList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;

  .menu-item {
    background: #25150c;
    border: 1.5px solid rgba(229, 169, 59, 0.25);
    border-radius: 14px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;

    &:hover {
      border-color: #ffd875;
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
    }

    .item-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;

      .badge-icon {
        font-size: 28px;
      }

      .name {
        font-weight: 700;
        font-size: 14px;
        color: #ffd875;
      }
    }

    .desc {
      font-size: 11.5px;
      color: #d1bda9;
      line-height: 1.4;
      margin-bottom: 12px;
      min-height: 34px;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .price {
        font-size: 13px;
        font-weight: 700;
        color: #f1c40f;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      button {
        padding: 6px 14px;
        border-radius: 8px;
        border: none;
        background: linear-gradient(135deg, #e67e22, #d35400);
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;

        &:hover {
          filter: brightness(1.15);
        }
      }
    }
  }
`

interface Customer {
  id: string
  name: string
  house: 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff'
  avatar: string
  order: {
    tea: 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff'
    sugar: number
    ice: number
    toppings: string[]
  }
  dialog: string
}

const CUSTOMERS_POOL: Customer[] = [
  {
    id: 'c1',
    name: 'Harry Potter ⚡',
    house: 'gryffindor',
    avatar: '🦁',
    order: {
      tea: 'gryffindor',
      sugar: 50,
      ice: 50,
      toppings: ['boba_gold', 'cheese'],
    },
    dialog: '"Cho tớ 1 ly Hồng Trà Gryffindor sôi động, 50% đường, vừa đá, thêm trân châu hoàng kim & kem cheese tuyết tiếp sức đấu Quidditch nào!"',
  },
  {
    id: 'c2',
    name: 'Draco Malfoy 🐍',
    house: 'slytherin',
    avatar: '🐍',
    order: {
      tea: 'slytherin',
      sugar: 0,
      ice: 50,
      toppings: ['moon_jelly'],
    },
    dialog: '"Chỉ phục vụ ta Ô Long Slytherin thượng hạng không đường, ít đá và thạch ánh trăng lấp lánh thôi nhé!"',
  },
  {
    id: 'c3',
    name: 'Luna Lovegood 🌙',
    house: 'ravenclaw',
    avatar: '🦅',
    order: {
      tea: 'ravenclaw',
      sugar: 100,
      ice: 100,
      toppings: ['boba_black', 'moon_jelly'],
    },
    dialog: '"Một ly Lục Trà Ravenclaw ngọt mát 100% đường đá, thêm trân châu đen & thạch mặt trăng để bắt loài Nargle nào~"',
  },
  {
    id: 'c4',
    name: 'Neville Longbottom 🦡',
    house: 'hufflepuff',
    avatar: '🦡',
    order: {
      tea: 'hufflepuff',
      sugar: 50,
      ice: 0,
      toppings: ['boba_gold'],
    },
    dialog: '"Bác Sprout dặn làm ly Trà Sữa Mật Ong Hufflepuff ấm áp, 50% đường, trân châu hoàng kim bồi bổ sau giờ Thảo Dược!"',
  },
]

const TEA_CONFIG = {
  gryffindor: { name: 'Hồng Trà Gryffindor', color: '#c0392b', height: 110 },
  slytherin: { name: 'Ô Long Slytherin', color: '#16a085', height: 110 },
  ravenclaw: { name: 'Lục Trà Ravenclaw', color: '#2980b9', height: 110 },
  hufflepuff: { name: 'Trà Sữa Mật Ong Hufflepuff', color: '#f39c12', height: 110 },
}

export default function BobaTeaShopModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'craft' | 'menu'>('craft')
  const [galleons, setGalleons] = useState(120)
  const [housePoints, setHousePoints] = useState(30)
  const [servedCount, setServedCount] = useState(0)

  // Customer order state
  const [customerIndex, setCustomerIndex] = useState(0)
  const currentCustomer = CUSTOMERS_POOL[customerIndex % CUSTOMERS_POOL.length]

  // Player's craft state
  const [selectedTea, setSelectedTea] = useState<'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff' | null>(null)
  const [selectedSugar, setSelectedSugar] = useState<number>(50)
  const [selectedIce, setSelectedIce] = useState<number>(50)
  const [selectedToppings, setSelectedToppings] = useState<string[]>([])
  const [isShaking, setIsShaking] = useState(false)
  const [isSealed, setIsSealed] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; success: boolean } | null>(null)

  // Toggle topping
  const toggleTopping = (topKey: string) => {
    if (selectedToppings.includes(topKey)) {
      setSelectedToppings(selectedToppings.filter((t) => t !== topKey))
    } else {
      setSelectedToppings([...selectedToppings, topKey])
    }
  }

  // Shake & Seal Shaker
  const handleShake = () => {
    if (!selectedTea) {
      alert('Vui lòng chọn cốt trà trước khi lắc bình shaker!')
      return
    }
    setIsShaking(true)
    setTimeout(() => {
      setIsShaking(false)
      setIsSealed(true)
    }, 1200)
  }

  // Clear craft
  const handleClear = () => {
    setSelectedTea(null)
    setSelectedSugar(50)
    setSelectedIce(50)
    setSelectedToppings([])
    setIsSealed(false)
    setFeedback(null)
  }

  // Serve to Customer
  const handleServe = () => {
    if (!selectedTea) {
      alert('Chưa có trà trong ly để giao cho khách!')
      return
    }

    const order = currentCustomer.order
    const isCorrectTea = selectedTea === order.tea
    const isCorrectSugar = selectedSugar === order.sugar
    const isCorrectIce = selectedIce === order.ice
    const isCorrectToppings =
      order.toppings.length === selectedToppings.length &&
      order.toppings.every((t) => selectedToppings.includes(t))

    if (isCorrectTea && isCorrectSugar && isCorrectIce && isCorrectToppings) {
      // Perfect match!
      setGalleons((prev) => prev + 30)
      setHousePoints((prev) => prev + 15)
      setServedCount((prev) => prev + 1)
      setFeedback({
        text: `✨ Xuất sắc! ${currentCustomer.name} chấm 5 sao! (+30 Galleon, +15 Điểm Nhà)`,
        success: true,
      })

      // Next customer after 1.8s
      setTimeout(() => {
        setCustomerIndex((prev) => prev + 1)
        handleClear()
      }, 1800)
    } else {
      // Small mistake but still rewards
      setGalleons((prev) => prev + 10)
      setFeedback({
        text: `Hơi nhầm vị một chút bồ ơi! Nhưng khách vẫn khen và gửi +10 Galleon tiền trà!`,
        success: false,
      })
      setTimeout(() => {
        setCustomerIndex((prev) => prev + 1)
        handleClear()
      }, 2000)
    }
  }

  // Drink instant boba
  const handleDrinkBoba = (teaName: string) => {
    if (galleons < 15) {
      alert('Không đủ Galleon để mua trà sữa!')
      return
    }
    setGalleons((prev) => prev - 15)

    // Trigger in-game avatar drink bubble
    const game = phaserGame.scene.keys.game as Game
    if (game && game.myPlayer) {
      // Broadcast chat or emote
      game.network.addChatMessage(`vừa thưởng thức 1 ly [${teaName}] thơm ngon tuyệt đỉnh! 🧋✨`)
    }

    alert(`🎉 Bạn đã thưởng thức 1 ly ${teaName}! Tinh thần sảng khoái và hồi phục năng lượng phép thuật!`)
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ShopCard onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <HeaderBar>
          <div className="title-group">
            <span className="icon">🧋</span>
            <div>
              <h2>Tiệm Trà Sữa Phép Thuật Hogsmeade</h2>
              <p className="subtitle">Hương vị 4 Nhà Hogwarts & Thảo dược thơm lành</p>
            </div>
          </div>
          <div className="stats-badges">
            <div className="badge">
              <MonetizationOnIcon style={{ fontSize: 16, color: '#f1c40f' }} />
              {galleons} Galleons
            </div>
            <div className="badge">
              <EmojiEventsIcon style={{ fontSize: 16, color: '#e67e22' }} />
              +{housePoints} Điểm
            </div>
            <IconButton onClick={onClose} size="small" style={{ color: '#dfba86' }}>
              <CloseIcon />
            </IconButton>
          </div>
        </HeaderBar>

        {/* Tab Navigation */}
        <TabsRow>
          <button
            className={activeTab === 'craft' ? 'active' : ''}
            onClick={() => setActiveTab('craft')}
          >
            🍹 Vào Ca Pha Chế (Đã phục vụ: {servedCount})
          </button>
          <button
            className={activeTab === 'menu' ? 'active' : ''}
            onClick={() => setActiveTab('menu')}
          >
            📜 Menu Đặc Biệt & Thưởng Thức
          </button>
        </TabsRow>

        {/* Body Content */}
        <ContentBody>
          {activeTab === 'craft' ? (
            <>
              {/* Order Ticket */}
              <OrderTicketBox>
                <div className="customer-avatar">{currentCustomer.avatar}</div>
                <div className="order-details">
                  <div className="customer-name">{currentCustomer.name} (Học viên {currentCustomer.house.toUpperCase()})</div>
                  <div className="order-dialog">{currentCustomer.dialog}</div>
                </div>
              </OrderTicketBox>

              {/* Crafting Station Grid */}
              <CraftingGrid>
                {/* Left: Cup Visual Preview */}
                <CupPreviewBox $shaking={isShaking}>
                  <div className="cup-container">
                    <div className="cup-lid" />
                    <div className="cup-straw" />
                    <div className="cup-outline">
                      {/* Tea Liquid */}
                      {selectedTea && (
                        <div
                          className="tea-liquid"
                          style={{
                            height: TEA_CONFIG[selectedTea].height,
                            background: `linear-gradient(to top, ${TEA_CONFIG[selectedTea].color}, ${TEA_CONFIG[selectedTea].color}dd)`,
                          }}
                        />
                      )}

                      {/* Cheese Foam Layer */}
                      {selectedToppings.includes('cheese') && <div className="cheese-layer" />}

                      {/* Ice Cubes */}
                      {selectedIce > 0 && selectedTea && (
                        <div className="ice-cubes">
                          {selectedIce === 50 ? <span>🧊</span> : <span>🧊🧊</span>}
                        </div>
                      )}

                      {/* Boba Toppings */}
                      <div className="topping-layer">
                        {selectedToppings.includes('boba_gold') && (
                          <>
                            <span style={{ fontSize: 13 }}>🌕</span>
                            <span style={{ fontSize: 13 }}>🌕</span>
                            <span style={{ fontSize: 13 }}>🌕</span>
                          </>
                        )}
                        {selectedToppings.includes('boba_black') && (
                          <>
                            <span style={{ fontSize: 12 }}>🖤</span>
                            <span style={{ fontSize: 12 }}>🖤</span>
                            <span style={{ fontSize: 12 }}>🖤</span>
                          </>
                        )}
                        {selectedToppings.includes('moon_jelly') && (
                          <span style={{ fontSize: 13 }}>🌙</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div style={{ marginTop: 14, fontSize: 12, color: '#ffd875', fontWeight: 600 }}>
                    {isShaking
                      ? '✨ Đang lắc bình shaker ma thuật…'
                      : isSealed
                      ? '🔒 Đã dập nắp sẵn sàng giao!'
                      : selectedTea
                      ? `Đang pha: ${TEA_CONFIG[selectedTea].name}`
                      : '👉 Hãy chọn cốt trà bên phải'}
                  </div>

                  {feedback && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 12,
                        background: feedback.success ? 'rgba(39, 174, 96, 0.3)' : 'rgba(230, 126, 34, 0.3)',
                        border: `1px solid ${feedback.success ? '#2ecc71' : '#e67e22'}`,
                        color: feedback.success ? '#a8ffc4' : '#ffd59e',
                        textAlign: 'center',
                      }}
                    >
                      {feedback.text}
                    </div>
                  )}
                </CupPreviewBox>

                {/* Right: Ingredient Controls */}
                <ControlsSection>
                  {/* 1. Cốt Trà 4 Nhà */}
                  <div className="option-group">
                    <div className="label">1. Cốt Trà 4 Nhà Phép Thuật</div>
                    <div className="btn-row">
                      <SelectButton
                        $active={selectedTea === 'gryffindor'}
                        $color="#c0392b"
                        onClick={() => setSelectedTea('gryffindor')}
                      >
                        🦁 Hồng Trà Gryffindor
                      </SelectButton>
                      <SelectButton
                        $active={selectedTea === 'slytherin'}
                        $color="#16a085"
                        onClick={() => setSelectedTea('slytherin')}
                      >
                        🐍 Ô Long Slytherin
                      </SelectButton>
                      <SelectButton
                        $active={selectedTea === 'ravenclaw'}
                        $color="#2980b9"
                        onClick={() => setSelectedTea('ravenclaw')}
                      >
                        🦅 Lục Trà Ravenclaw
                      </SelectButton>
                      <SelectButton
                        $active={selectedTea === 'hufflepuff'}
                        $color="#d35400"
                        onClick={() => setSelectedTea('hufflepuff')}
                      >
                        🦡 Trà Sữa Hufflepuff
                      </SelectButton>
                    </div>
                  </div>

                  {/* 2. Mức Đường & Đá */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="option-group">
                      <div className="label">2. Mức Đường</div>
                      <div className="btn-row">
                        {[0, 50, 100].map((s) => (
                          <SelectButton
                            key={s}
                            $active={selectedSugar === s}
                            onClick={() => setSelectedSugar(s)}
                          >
                            {s === 0 ? '0% Nhạt' : s === 50 ? '50% Vừa' : '100% Ngọt'}
                          </SelectButton>
                        ))}
                      </div>
                    </div>

                    <div className="option-group">
                      <div className="label">3. Mức Đá</div>
                      <div className="btn-row">
                        {[0, 50, 100].map((i) => (
                          <SelectButton
                            key={i}
                            $active={selectedIce === i}
                            onClick={() => setSelectedIce(i)}
                          >
                            {i === 0 ? '0% Ấm' : i === 50 ? '50% Ít Đá' : '100% Lạnh'}
                          </SelectButton>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 3. Topping Ma Thuật */}
                  <div className="option-group">
                    <div className="label">4. Topping Phép Thuật (Chọn nhiều)</div>
                    <div className="btn-row">
                      <SelectButton
                        $active={selectedToppings.includes('boba_gold')}
                        onClick={() => toggleTopping('boba_gold')}
                      >
                        🌕 Trân Châu Hoàng Kim
                      </SelectButton>
                      <SelectButton
                        $active={selectedToppings.includes('boba_black')}
                        onClick={() => toggleTopping('boba_black')}
                      >
                        🖤 Trân Châu Sao Đêm
                      </SelectButton>
                      <SelectButton
                        $active={selectedToppings.includes('moon_jelly')}
                        onClick={() => toggleTopping('moon_jelly')}
                      >
                        🌙 Thạch Ánh Trăng
                      </SelectButton>
                      <SelectButton
                        $active={selectedToppings.includes('cheese')}
                        onClick={() => toggleTopping('cheese')}
                      >
                        🍦 Kem Cheese Tuyết
                      </SelectButton>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <ActionsBar>
                    <button className="btn-shake" onClick={handleShake}>
                      <AutoAwesomeIcon style={{ fontSize: 18 }} />
                      Lắc Shaker & Dập Nắp
                    </button>
                    <button className="btn-serve" onClick={handleServe}>
                      <CheckCircleIcon style={{ fontSize: 18 }} />
                      Giao Cho Khách
                    </button>
                    <button className="btn-clear" onClick={handleClear} title="Đổ đi làm lại">
                      <RefreshIcon style={{ fontSize: 20 }} />
                    </button>
                  </ActionsBar>
                </ControlsSection>
              </CraftingGrid>
            </>
          ) : (
            /* Menu Tab */
            <MenuList>
              <div className="menu-item">
                <div>
                  <div className="item-header">
                    <span className="badge-icon">🦡</span>
                    <span className="name">Trà Sữa Hufflepuff Mật Ong</span>
                  </div>
                  <div className="desc">
                    Trà sữa kem béo ngậy ủ cùng mật ong rừng Cấm và trân châu hoàng kim dẻo thơm.
                  </div>
                </div>
                <div className="price-row">
                  <span className="price">15 Galleons</span>
                  <button onClick={() => handleDrinkBoba('Trà Sữa Hufflepuff Mật Ong')}>
                    Mua & Uống Ngay
                  </button>
                </div>
              </div>

              <div className="menu-item">
                <div>
                  <div className="item-header">
                    <span className="badge-icon">🦁</span>
                    <span className="name">Hồng Trà Gryffindor Quế Nồng</span>
                  </div>
                  <div className="desc">
                    Hồng trà Ceylon đậm đà ủ ấm cùng quế nồng và trân châu đường đen sao đêm.
                  </div>
                </div>
                <div className="price-row">
                  <span className="price">15 Galleons</span>
                  <button onClick={() => handleDrinkBoba('Hồng Trà Gryffindor Quế Nồng')}>
                    Mua & Uống Ngay
                  </button>
                </div>
              </div>

              <div className="menu-item">
                <div>
                  <div className="item-header">
                    <span className="badge-icon">🦅</span>
                    <span className="name">Lục Trà Ravenclaw Trí Tuệ</span>
                  </div>
                  <div className="desc">
                    Trà hoa nhài thanh khiết, ngâm cùng thạch ánh trăng lung linh tăng cường minh mẫn.
                  </div>
                </div>
                <div className="price-row">
                  <span className="price">15 Galleons</span>
                  <button onClick={() => handleDrinkBoba('Lục Trà Ravenclaw Trí Tuệ')}>
                    Mua & Uống Ngay
                  </button>
                </div>
              </div>

              <div className="menu-item">
                <div>
                  <div className="item-header">
                    <span className="badge-icon">🐍</span>
                    <span className="name">Ô Long Slytherin Kem Mặn</span>
                  </div>
                  <div className="desc">
                    Trà ô long núi đá đậm vị trà, phủ lớp kem cheese tuyết muối biển béo ngậy huyền bí.
                  </div>
                </div>
                <div className="price-row">
                  <span className="price">15 Galleons</span>
                  <button onClick={() => handleDrinkBoba('Ô Long Slytherin Kem Mặn')}>
                    Mua & Uống Ngay
                  </button>
                </div>
              </div>
            </MenuList>
          )}
        </ContentBody>
      </ShopCard>
    </ModalOverlay>
  )
}

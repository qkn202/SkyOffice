export function getHouseBadge(houseRaw?: string): { badge: string; name: string; color: string } {
  const house = (houseRaw || '').toUpperCase()
  switch (house) {
    case 'GRYFFINDOR':
      return { badge: '🦁', name: 'Gryffindor', color: '#ef4444' }
    case 'SLYTHERIN':
      return { badge: '🐍', name: 'Slytherin', color: '#10b981' }
    case 'RAVENCLAW':
      return { badge: '🦅', name: 'Ravenclaw', color: '#0ea5e9' }
    case 'HUFFLEPUFF':
      return { badge: '🦡', name: 'Hufflepuff', color: '#f59e0b' }
    default:
      return { badge: '🧙', name: 'Phù thủy', color: '#ffd875' }
  }
}

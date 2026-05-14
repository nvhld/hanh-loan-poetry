import type { CanonicalPoem } from '@/runtime/literary-data'

export type AnchorTone = 'entropy' | 'silence' | 'transition' | 'distance'

export type AnchorProfile = {
  order: number
  id: string
  slug: string
  tone: AnchorTone
  fieldLabel: string
  roomNote: string
  residue: string
  width: 'intimate' | 'open' | 'wide'
}

export type AnchorEntry = {
  poem: CanonicalPoem
  profile: AnchorProfile
}

export const ANCHOR_PROFILES: AnchorProfile[] = [
  {
    order: 1,
    id: '2016-008-vui',
    slug: 'vui',
    tone: 'silence',
    fieldLabel: 'trường ký ức',
    roomNote: 'một mảnh lặng đặt sát nền tối',
    residue: 'ký ức còn nằm rất thấp',
    width: 'intimate',
  },
  {
    order: 2,
    id: '2023-078-thoi-gian-va-tinh-yeu',
    slug: 'thoi-gian-va-tinh-yeu',
    tone: 'entropy',
    fieldLabel: 'trường thời gian',
    roomNote: 'căn phòng phải mở thẳng vào chữ',
    residue: 'thời gian vẫn còn lạnh ở mép trang',
    width: 'open',
  },
  {
    order: 3,
    id: '2022-038-binh-minh-em-va-hoang-hon-anh',
    slug: 'binh-minh-em-va-hoang-hon-anh',
    tone: 'transition',
    fieldLabel: 'trường giao sáng',
    roomNote: 'hai phía ánh sáng giữ cùng một nhịp',
    residue: 'bình minh vẫn chạm vào hoàng hôn',
    width: 'open',
  },
  {
    order: 4,
    id: '2020-020-boi-vi-em-yeu-anh',
    slug: 'boi-vi-em-yeu-anh',
    tone: 'entropy',
    fieldLabel: 'trường mỏng',
    roomNote: 'đọc như một điều có thể mất ngay',
    residue: 'đặc biệt chỉ còn khi tình yêu còn sáng',
    width: 'intimate',
  },
  {
    order: 5,
    id: '2023-083-bon-mua-co-con-nhau',
    slug: 'bon-mua-co-con-nhau',
    tone: 'silence',
    fieldLabel: 'trường bốn mùa',
    roomNote: 'mùa đi qua nhau bằng khoảng trống',
    residue: 'bốn mùa lùi dần vào một vệt nhớ',
    width: 'intimate',
  },
  {
    order: 6,
    id: '2023-074-nang-i',
    slug: 'nang-i',
    tone: 'silence',
    fieldLabel: 'trường chờ',
    roomNote: 'một dáng chờ không cần được giải thích',
    residue: 'mặt trời lên chậm hơn lời hứa',
    width: 'intimate',
  },
  {
    order: 7,
    id: '2022-040-hai-mien-thang-5',
    slug: 'hai-mien-thang-5',
    tone: 'distance',
    fieldLabel: 'trường chia miền',
    roomNote: 'khoảng cách đi qua bằng nhịp ngắn',
    residue: 'trái tim vẫn chia hai miền',
    width: 'intimate',
  },
  {
    order: 8,
    id: '2022-067-ben-nay-ben-kia',
    slug: 'ben-nay-ben-kia',
    tone: 'distance',
    fieldLabel: 'trường hai bờ',
    roomNote: 'đừng làm đại dương ồn hơn bài thơ',
    residue: 'bên này vẫn đợi một bên kia',
    width: 'intimate',
  },
  {
    order: 9,
    id: '2022-032-tra-anh-ve-phia-binh-minh',
    slug: 'tra-anh-ve-phia-binh-minh',
    tone: 'silence',
    fieldLabel: 'trường trả lại',
    roomNote: 'lời im lặng cần nhiều khoảng thở',
    residue: 'bình minh nhận lại phần không giữ được',
    width: 'intimate',
  },
  {
    order: 10,
    id: '2023-102-thang-12-cho-em',
    slug: 'thang-12-cho-em',
    tone: 'transition',
    fieldLabel: 'trường cuối năm',
    roomNote: 'để tháng mười hai rơi từng nấc',
    residue: 'một tháng mở ra từ điểm kết thúc',
    width: 'open',
  },
  {
    order: 11,
    id: '2022-047-bay-gio-thang-tam-roi-anh',
    slug: 'bay-gio-thang-tam-roi-anh',
    tone: 'transition',
    fieldLabel: 'trường tháng tám',
    roomNote: 'mỗi dòng nên giữ một vệt nắng',
    residue: 'tháng tám vẫn còn ở trán mùa thu',
    width: 'open',
  },
  {
    order: 12,
    id: '2023-082-mua-he-o-boston',
    slug: 'mua-he-o-boston',
    tone: 'entropy',
    fieldLabel: 'trường Boston',
    roomNote: 'rộng hơn, chậm hơn, không làm cô đơn bị trang trí',
    residue: 'mùa hè khép lại như một cơn mê',
    width: 'wide',
  },
]

const ANCHOR_BY_ID = new Map(ANCHOR_PROFILES.map((profile) => [profile.id, profile]))
const ANCHOR_BY_SLUG = new Map(ANCHOR_PROFILES.map((profile) => [profile.slug, profile]))

export function getAnchorProfile(poem: CanonicalPoem): AnchorProfile | null {
  return ANCHOR_BY_ID.get(poem.id) ?? ANCHOR_BY_SLUG.get(poem.slug) ?? null
}

export function getAnchorEntries(poems: CanonicalPoem[]): AnchorEntry[] {
  return ANCHOR_PROFILES
    .map((profile) => {
      const poem = poems.find((candidate) => candidate.id === profile.id || candidate.slug === profile.slug)
      return poem ? { poem, profile } : null
    })
    .filter((entry): entry is AnchorEntry => Boolean(entry))
}

export function getAnchorNavigation(entries: AnchorEntry[], profile: AnchorProfile) {
  const index = entries.findIndex((entry) => entry.profile.id === profile.id)
  if (index < 0) return { previous: null, next: null }
  return {
    previous: entries[(index - 1 + entries.length) % entries.length],
    next: entries[(index + 1) % entries.length],
  }
}

export function splitBodyIntoStanzas(body: string): string[][] {
  return body
    .trim()
    .split(/\n{2,}/)
    .map((stanza) => stanza.split('\n').map((line) => line.trimEnd()))
    .filter((stanza) => stanza.some((line) => line.trim().length > 0))
}

export function protectVietnameseOrphan(line: string): string {
  const trimmed = line.trim()
  if (trimmed.length < 32 || !trimmed.includes(' ')) return line

  const words = trimmed.split(/\s+/)
  const keepCount = trimmed.length >= 54 && words.length >= 6 ? 3 : 2
  if (words.length <= keepCount + 1) return line

  const leading = line.match(/^\s*/)?.[0] ?? ''
  const head = words.slice(0, -keepCount).join(' ')
  const tail = words.slice(-keepCount).join('\u00a0')
  return `${leading}${head} ${tail}`
}

export function formatDateLabel(poem: CanonicalPoem): string {
  if (!poem.date) return poem.year ? String(poem.year) : ''
  const [year, month, day] = poem.date.split('-')
  if (!year || !month || !day) return poem.date
  return `${day}.${month}.${year}`
}

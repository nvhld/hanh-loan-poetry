// ============================================================
// PROTOTYPE DATA — 3 poems, emotional field vectors manually set.
// This is the "single emotional field prototype" per spec:
// build this first. If it feels alive, everything else will too.
// ============================================================

import type { Poem } from '@/types/poem'

export const PROTOTYPE_POEMS: Poem[] = [
  {
    id: '2020-19-hoan-hao',
    slug: 'hoan-hao',
    title: 'Hoàn Hảo',
    year: 2020,
    date: '2020-05-31',
    sequence: 19,
    pdfFile: '2020.5.31.HoanHao.19.pdf',
    webpFile: '/poems/webp/2020.5.31.HoanHao.19.webp',
    excerpt: 'Bỗng trên đường\nVấp vào một hòn bi\nLăn không phương hướng',
    textContent: `Bỗng trên đường
Vấp vào một hòn bi
Lăn không phương hướng
Hòn bi tròn trịa không tỳ vết
Không còn gì chê trách
và cũng chẳng có gì mơ ước...

Nếu như anh hoàn hảo quá
Thì không còn gì để yêu
Hòn bi không góc cạnh
Rồi sẽ lăn bất cứ chỗ nào...`,
    emotionalField: {
      longing: 0.5,
      entropy: 0.6,
      eros: 0.3,
      warmth: 0.2,
      ambiguity: 0.8,
      transcendence: 0.4,
      isolation: 0.3,
      memoryPressure: 0.4,
    },
    dominantField: 'entropy',
    gravityMass: 1.4,
    colorHex: '#1c1c1c',
    glowHex: '#b0bec5',
    resonanceState: 'warm',
    memoryDensity: 42,
    decayRate: 0.04,
    position: { x: 0, y: 0 }, // assigned by simulation
    critics: [],
    tags: {
      space: [],
      season: [],
      motif: ['huu_han', 'tinh_yeu', 'triet_hoc'],
    },
  },
  {
    id: '2020-21-boi-vi-em-yeu-anh',
    slug: 'boi-vi-em-yeu-anh',
    title: 'Bởi Vì Em Yêu Anh',
    year: 2020,
    date: '2020-06-20',
    sequence: 20,
    pdfFile: '2020.6.20.BoiViEyeuA.20.pdf',
    webpFile: '/poems/webp/2020.6.20.BoiViEyeuA.20.webp',
    excerpt: 'Bởi vì em yêu anh\nAnh thành người đặc biệt\nNếu em không còn yêu\nAnh cũng như người khác',
    textContent: `Bởi vì em yêu anh
Anh thành người đặc biệt
Nếu em không còn yêu
Anh cũng như người khác

Anh đừng nghe cơn gió
Nói rằng em luỵ tình
Vì tình là cơn gió
Đến và đi rất nhanh

Anh đừng nghe cơn sóng
Nói em dễ thay lòng
Vì tình như con sóng
Rồi tan vào mênh mông

Anh đừng quên anh nhé
Tình yêu rất mong manh
Anh chỉ thành đặc biệt
Khi em còn yêu anh...`,
    emotionalField: {
      longing: 0.7,
      entropy: 0.5,
      eros: 0.8,
      warmth: 0.9,
      ambiguity: 0.3,
      transcendence: 0.2,
      isolation: 0.1,
      memoryPressure: 0.4,
    },
    dominantField: 'eros',
    gravityMass: 2.2,
    colorHex: '#6d3000',
    glowHex: '#ffb300',
    resonanceState: 'burning',
    memoryDensity: 187,
    decayRate: 0.03,
    position: { x: 0, y: 0 },
    critics: [
      {
        id: 'nqt-01',
        criticName: 'Nguyễn Quang Thiều',
        role: 'Chủ tịch Hội Nhà văn Việt Nam',
        quote: 'những câu thơ trước là dây cháy, còn câu cuối là thuốc nổ!',
        orbitalRadius: 140,
        orbitalSpeed: 0.4,
        orbitalPhase: 0,
      },
    ],
    tags: {
      space: [],
      season: [],
      motif: ['tinh_yeu', 'nu_quyen', 'ban_nga'],
    },
  },
  {
    id: '2019-12-tho-tinh-marina-bay',
    slug: 'tho-tinh-marina-bay',
    title: 'Thơ Tình Marina Bay',
    year: 2019,
    date: '2019-06-20',
    sequence: 12,
    pdfFile: '2019.6.20.Marina.12.pdf',
    webpFile: '/poems/webp/2019.6.20.Marina.12.webp',
    excerpt: 'Một ngày em đến Marina Bay\nNhững toà tháp nguy nga nhìn em buồn không nói\nDòng người băng qua em như đàn kiến vội',
    textContent: `Một ngày em đến Marina Bay
Những toà tháp nguy nga nhìn em buồn không nói
Dòng người băng qua em như đàn kiến vội
Em nghĩ về anh như thành phố nghĩ khu vườn

Em khớp dấu chân anh trên những nẻo đường
Tóc cây xanh phủ tràn khuôn mặt phố
Mưa chiều Singapore hôn lên làn mi nhớ
Căn phòng nào vang nhịp thở trái tim anh

Em gõ vào tường đêm bằng tiếng bước chân mình
Không trốn nổi câu thơ đang đuổi bắt
Có thể nào tìm một vì sao đã tắt
Xác vỡ trôi trên đáy vịnh sâu kia

Em xếp những nghĩ suy thành một bài thơ
Bỗng nhận ra trái tim mình đang héo
Lòng muốn được yêu như con thuyền trong cơn bão
Có nghiêng ngả chòng chành mới thấu những đắm say

Ngỡ em viết cho anh, đám mây nhỏ đã vụt bay
Không!
Là em viết cho em khi lòng
không chút gió
Em ốc đảo hồn mình khi thương nhớ ngập vườn cây...`,
    emotionalField: {
      longing: 0.95,
      entropy: 0.4,
      eros: 0.6,
      warmth: 0.1,
      ambiguity: 0.5,
      transcendence: 0.3,
      isolation: 0.9,
      memoryPressure: 0.85,
    },
    dominantField: 'longing',
    gravityMass: 2.6,
    colorHex: '#1a3a5c',
    glowHex: '#4fc3f7',
    resonanceState: 'supernova',
    memoryDensity: 312,
    decayRate: 0.02,
    position: { x: 0, y: 0 },
    critics: [
      {
        id: 'ntt-01',
        criticName: 'Nguyễn Trọng Tạo',
        role: 'Nhà thơ, Nhạc sỹ, Hoạ sỹ',
        quote: 'Thơ Hạnh Loan can đảm hơn cô ấy',
        orbitalRadius: 160,
        orbitalSpeed: 0.3,
        orbitalPhase: Math.PI,
      },
    ],
    tags: {
      space: ['nuoc_ngoai', 'phi_truong'],
      season: [],
      motif: ['khoang_cach', 'nho_nhuong', 'co_don', 'thien_van'],
    },
  },
]

export const PROTOTYPE_EDGES = [
  {
    source: '2019-12-tho-tinh-marina-bay',
    target: '2020-21-boi-vi-em-yeu-anh',
    strength: 0.52,
    sharedTags: ['tinh_yeu'],
    glowColor: '#4fc3f7',
  },
  {
    source: '2020-19-hoan-hao',
    target: '2020-21-boi-vi-em-yeu-anh',
    strength: 0.38,
    sharedTags: ['tinh_yeu'],
    glowColor: '#ffb300',
  },
]

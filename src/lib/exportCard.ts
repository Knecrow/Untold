/**
 * Generates and downloads a high-resolution, aesthetic paper card image
 * formatted for Instagram Stories, Twitter/X, and WhatsApp.
 */

export interface ExportCardData {
  text: string
  category: {
    label: string
    emoji: string
    color: string
    textColor: string
  }
}

export async function exportCardAsImage(data: ExportCardData, noteId: string): Promise<void> {
  const width = 1080
  const height = 1080
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 1. Canvas Background (Warm Studio Paper)
  ctx.fillStyle = '#F7F4EE'
  ctx.fillRect(0, 0, width, height)

  // Subtle dot matrix
  ctx.fillStyle = 'rgba(45, 42, 38, 0.05)'
  const dotSpacing = 28
  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {
      ctx.beginPath()
      ctx.arc(x, y, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // 2. Card Dimensions
  const cardMargin = 80
  const cardWidth = width - cardMargin * 2
  const cardHeight = height - cardMargin * 2
  const cardX = cardMargin
  const cardY = cardMargin
  const radius = 32

  // Shadow (Neubrutalism hard shadow)
  ctx.fillStyle = '#000000'
  roundRect(ctx, cardX + 12, cardY + 12, cardWidth, cardHeight, radius)
  ctx.fill()

  // Card Fill (Stationery color)
  ctx.fillStyle = data.category.color || '#FFFBEB'
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, radius)
  ctx.fill()

  // Card Border
  ctx.lineWidth = 5
  ctx.strokeStyle = '#000000'
  roundRect(ctx, cardX, cardY, cardWidth, cardHeight, radius)
  ctx.stroke()

  // 3. Category Tag
  const tagY = cardY + 70
  const tagText = `${data.category.emoji}  ${data.category.label}`
  ctx.font = 'bold 30px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = 'rgba(45, 42, 38, 0.75)'
  ctx.fillText(tagText, cardX + 60, tagY)

  // 4. Main Thought / Story Body
  const textX = cardX + 60
  const maxTextWidth = cardWidth - 120
  ctx.fillStyle = '#1C1A18'

  // Word-wrap & dynamic font size calculation based on story length
  const words = data.text.split(/\s+/)
  let fontSize = 34
  let lineHeight = 50
  let textY = cardY + 160

  if (words.length > 100) {
    fontSize = 24
    lineHeight = 38
    textY = cardY + 140
  } else if (words.length > 60) {
    fontSize = 28
    lineHeight = 44
    textY = cardY + 150
  }

  ctx.font = `500 ${fontSize}px "Plus Jakarta Sans", sans-serif`

  let line = ''
  let currentY = textY

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    const testWidth = metrics.width
    if (testWidth > maxTextWidth && n > 0) {
      ctx.fillText(line, textX, currentY)
      line = words[n] + ' '
      currentY += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, textX, currentY)

  // 5. Watermark Footer
  const footerY = cardY + cardHeight - 60
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cardX + 50, footerY - 30)
  ctx.lineTo(cardX + cardWidth - 50, footerY - 30)
  ctx.stroke()

  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = 'rgba(45, 42, 38, 0.65)'
  ctx.fillText('✦ Taleless · Anonymous & Unspoken', cardX + 60, footerY)

  ctx.font = '500 24px "Plus Jakarta Sans", sans-serif'
  ctx.fillStyle = 'rgba(45, 42, 38, 0.45)'
  const domainText = typeof window !== 'undefined' && window.location.host
    ? window.location.host
    : 'taleless.vercel.app'
  const domainWidth = ctx.measureText(domainText).width
  ctx.fillText(domainText, cardX + cardWidth - 60 - domainWidth, footerY)

  // 6. Export to Blob and Download / Share
  canvas.toBlob(async blob => {
    if (!blob) return

    const fileName = `taleless-${noteId.slice(0, 8)}.png`
    const file = new File([blob], fileName, { type: 'image/png' })

    // Try native Web Share API on mobile (supports sharing directly to Instagram / Twitter / WhatsApp)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Taleless Story',
          text: `"${data.text.slice(0, 100)}..." via Taleless`,
        })
        return
      } catch {
        // User cancelled share or failed, fallback to download
      }
    }

    // Fallback: Trigger browser download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 'image/png')
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

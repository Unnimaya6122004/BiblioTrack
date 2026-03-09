import { useEffect, useRef } from "react"

type Particle = {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  size: number
  color: string
}

type PointerState = {
  x: number
  y: number
  vx: number
  vy: number
  active: boolean
}

function createParticles(count: number, width: number, height: number): Particle[] {
  const particles: Particle[] = []

  for (let i = 0; i < count; i++) {
    const useGoldenTone = i % 6 === 0
    const alpha = 0.32 + Math.random() * 0.22

    const baseX = Math.random() * width
    const baseY = Math.random() * height

    particles.push({
      x: baseX,
      y: baseY,
      baseX,
      baseY,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      size: Math.random() * 1.25 + 0.75,
      color: useGoldenTone
        ? `rgba(161,107,46,${alpha})`
        : `rgba(43,69,112,${alpha})`
    })
  }

  return particles
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      return
    }

    let rafId = 0
    let width = window.innerWidth
    let height = window.innerHeight

    const pointer: PointerState = {
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      active: false
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    const influenceRadius = 190
    const maxSpeed = 2.4

    const setCanvasSize = () => {
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = Math.floor(width * pixelRatio)
      canvas.height = Math.floor(height * pixelRatio)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const getParticleCount = () =>
      Math.max(180, Math.min(340, Math.floor((width * height) / 5200)))

    let particles = createParticles(getParticleCount(), width, height)

    setCanvasSize()

    const handleResize = () => {
      setCanvasSize()
      particles = createParticles(getParticleCount(), width, height)
    }

    const handlePointerMove = (x: number, y: number) => {
      pointer.vx = x - pointer.x
      pointer.vy = y - pointer.y
      pointer.x = x
      pointer.y = y
      pointer.active = true
    }

    const onMouseMove = (event: MouseEvent) => {
      handlePointerMove(event.clientX, event.clientY)
    }

    const onMouseLeave = () => {
      pointer.active = false
      pointer.vx = 0
      pointer.vy = 0
    }

    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) {
        return
      }

      handlePointerMove(touch.clientX, touch.clientY)
    }

    const onTouchEnd = () => {
      pointer.active = false
      pointer.vx = 0
      pointer.vy = 0
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (pointer.active) {
          const dx = p.x - pointer.x
          const dy = p.y - pointer.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < influenceRadius) {
            const normalizedX = dx / (distance || 1)
            const normalizedY = dy / (distance || 1)
            const ratio = 1 - distance / influenceRadius

            // Repel particles strongly near cursor.
            const repel = ratio * ratio * 1.25

            p.vx += normalizedX * repel + pointer.vx * 0.0014
            p.vy += normalizedY * repel + pointer.vy * 0.0014
          }
        }

        // Spring particles back to their base positions.
        p.vx += (p.baseX - p.x) * 0.018
        p.vy += (p.baseY - p.y) * 0.018

        p.vx *= 0.9
        p.vy *= 0.9

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > maxSpeed) {
          const scale = maxSpeed / speed
          p.vx *= scale
          p.vy *= scale
        }

        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > width) {
          p.vx *= -0.9
          p.x = Math.min(width, Math.max(0, p.x))
        }

        if (p.y < 0 || p.y > height) {
          p.vy *= -0.9
          p.y = Math.min(height, Math.max(0, p.y))
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
      }

      rafId = requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener("resize", handleResize)
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseleave", onMouseLeave)
    window.addEventListener("touchmove", onTouchMove, { passive: true })
    window.addEventListener("touchend", onTouchEnd)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseleave", onMouseLeave)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
    }

  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none opacity-90"
    />
  )
}

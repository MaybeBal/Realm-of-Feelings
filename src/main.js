import './style.css'
import { reflections } from './reflections.js'
import html2canvas from 'html2canvas'

document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('poemsGrid')
  const searchInput = document.getElementById('searchInput')
  const genreBtns = document.querySelectorAll('.genre-btn')
  const modal = document.getElementById('poemModal')
  const modalBody = document.getElementById('modalBody')
  const closeBtn = document.querySelector('.close-btn')

  // Language Elements
  const btnEn = document.getElementById('langEn')
  const btnId = document.getElementById('langId')
  const heroTitle = document.getElementById('heroTitle')
  const heroDesc = document.getElementById('heroDesc')
  const footerText = document.getElementById('footerText')
  const btnRandom = document.getElementById('btnRandom')
  const randomText = document.getElementById('randomText')
  const submitStoryText = document.getElementById('submitStoryText')

  // State
  let currentLang = 'en' // default to english

  // Auto Theme based on hour
  const currentHour = new Date().getHours()
  let initialTheme = 'midnight'
  if (currentHour >= 5 && currentHour < 15) {
    initialTheme = 'dawn' // 5 AM - 2:59 PM
  } else if (currentHour >= 15 && currentHour < 18) {
    initialTheme = 'dusk' // 3 PM - 5:59 PM
  }

  let currentTheme = initialTheme
  let isPlaying = false
  let savedIds = JSON.parse(localStorage.getItem('rof_saved') || '[]')
  let currentFilteredItems = []
  let typewriterTimeout = null
  let skipTypewriter = false
  let storyReadTimes = JSON.parse(localStorage.getItem('rof_story_times') || '{}')
  let activeStoryId = null

  const dict = {
    en: {
      heroTitle: "Diving into the Meaning Behind Feelings",
      heroDesc: "A collection of relatable reflections on love, distance, loneliness, and the journey of self-acceptance.",
      searchPlaceholder: "Search title, topic, or word...",
      empty: "No reflections found...",
      by: "By",
      factTitle: "Did You Know?",
      footerText: "&copy; 2026 Realm of Feelings.",
      logoTitle: "Realm of Feelings",
      randomBtnText: "Read Me Something",
      submitStory: "Submit Your Story",
      readTime: "min read",
      copied: "Link copied to clipboard!",
      exporting: "Generating image...",
      genres: {
        hubungan: 'Relationships',
        kehidupan: 'Life',
        dirisendiri: 'Self',
        malamhari: 'Late Night',
        kesepian: 'Loneliness',
        masalalu: 'Past',
        kenyataan: 'Reality',
        keluarga: 'Family',
        lain: 'Others',
        all: 'All'
      },
      dailyHighlight: "Today's Insight",
      moodTitle: "What's weighing on your mind?",
      moods: {
        sedih: "😢 Sad/Empty",
        lelah: "😫 Exhausted",
        overthinking: "🌪️ Overthinking",
        hancur: "💔 Broken",
        sepi: "👻 Lonely"
      },
      statsTime: "Time spent:",
      statsRead: "Stories read:",
      letGoBtn: "Let Go",
      letGoTitle: "The Letting Go Room",
      letGoDesc: "Write down what weighs heavy on your heart. Regrets, anger, or a name. When you are ready, let it go.",
      burnText: "Release & Burn",
      myNotes: "My Echoes",
      writeNoteTitle: "My Private Note",
      saveNoteText: "Save to My Echoes",
      breathing: "Breathe...",
      bottleBtn: "Message in a Bottle",
      bottleTitle: "Message in a Bottle",
      bottleDesc: "Throw your thoughts into the sea, and maybe you'll find a message from someone else.",
      throwBottle: "Throw Bottle",
      backupNotes: "Backup Notes"
    },
    id: {
      heroTitle: "Menyelami Makna di Balik Rasa",
      heroDesc: "Kumpulan catatan relatable tentang cinta, jarak, sepi, dan perjalanan menerima diri sendiri.",
      searchPlaceholder: "Cari judul, topik, atau kata...",
      empty: "Tidak ada catatan yang ditemukan...",
      by: "Oleh",
      factTitle: "Tahukah Kamu?",
      footerText: "&copy; 2026 Ruang Rasa.",
      logoTitle: "Ruang Rasa",
      randomBtnText: "Bacakan Sesuatu Untukku",
      submitStory: "Titipkan Cerita",
      readTime: "mnt baca",
      copied: "Tautan berhasil disalin!",
      exporting: "Menggambar gambar...",
      genres: {
        hubungan: 'Hubungan',
        kehidupan: 'Kehidupan',
        dirisendiri: 'Diri Sendiri',
        malamhari: 'Malam Hari',
        kesepian: 'Kesepian',
        masalalu: 'Masa Lalu',
        kenyataan: 'Kenyataan',
        keluarga: 'Keluarga',
        lain: 'Lain-lain',
        all: 'Semua'
      },
      dailyHighlight: "Sorotan Hari Ini",
      moodTitle: "Apa yang sedang memberatkan pikiranmu?",
      moods: {
        sedih: "😢 Sedih/Kosong",
        lelah: "😫 Lelah Kehidupan",
        overthinking: "🌪️ Overthinking",
        hancur: "💔 Hancur",
        sepi: "👻 Kesepian"
      },
      statsTime: "Waktu merenung:",
      statsRead: "Cerita diselami:",
      letGoBtn: "Lepaskan",
      letGoTitle: "Ruang Pelepas Keluh",
      letGoDesc: "Tulislah sesuatu yang menjadi beban di batinmu. Penyesalan, kemarahan, atau nama seseorang. Saat kau siap, lepaskanlah ia lalu lupakan.",
      burnText: "Lepaskan & Bakar",
      myNotes: "Catatanku",
      writeNoteTitle: "Catatan Pribadiku",
      saveNoteText: "Simpan Jurnal",
      breathing: "Bernapaslah secara perlahan...",
      bottleBtn: "Pesan dalam Botol",
      bottleTitle: "Pesan dalam Botol",
      bottleDesc: "Lemparkan isi hatimu ke arus lautan, dan barangkali kau akan menemukan gema dari pesan manusia lain.",
      throwBottle: "Lempar Botol",
      backupNotes: "Unduh Jurnal"
    }
  }

  // Audio Cues
  const audioCues = {
    paper: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-page-turn-single-1104.mp3'),
    chime: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fairy-magic-sparkle-871.mp3'),
    swoosh: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3')
  }

  function playAudioCue(type) {
    if (!audioCues[type]) return
    audioCues[type].volume = 0.4
    audioCues[type].currentTime = 0
    audioCues[type].play().catch(() => { })
  }

  // Dynamic Greeting based on Local Time
  function updateDynamicGreeting() {
    const heroTitleE = document.getElementById('heroTitle')
    if (!heroTitleE) return

    const d = dict[currentLang]
    const hour = new Date().getHours()

    let greeting = d.heroTitle
    if (currentLang === 'en') {
      if (hour >= 5 && hour < 12) greeting = "A peaceful morning to you..."
      else if (hour >= 12 && hour < 17) greeting = "The afternoon sun is settling..."
      else if (hour >= 17 && hour < 20) greeting = "Evening shadows are falling..."
      else if (hour >= 20 || hour < 0) greeting = "The night is quiet here..."
      else greeting = "It is very late up there, isn't it? Let's wander in the silence together..."
    } else {
      if (hour >= 5 && hour < 12) greeting = "Pagi yang damai untukmu..."
      else if (hour >= 12 && hour < 17) greeting = "Matahari sore mulai condong..."
      else if (hour >= 17 && hour < 20) greeting = "Bayang bayang malam mulai turun..."
      else if (hour >= 20 || hour < 0) greeting = "Malam yang begitu sunyi di sini..."
      else greeting = "Sangat larut malam, bukan? Mari berkelana bersama di dalam kesunyian ini..."
    }

    heroTitleE.textContent = greeting
  }

  // Generate background stars
  generateStars('stars', 100, 1)
  generateStars('stars2', 50, 2)
  generateStars('stars3', 25, 3)

  function generateStars(id, count, speed) {
    const starContainer = document.getElementById(id)
    if (!starContainer) return

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div')
      star.className = 'star-particle'
      star.style.position = 'absolute'
      star.style.width = speed + 'px'
      star.style.height = speed + 'px'
      star.style.background = 'var(--star-color)'
      star.style.borderRadius = '50%'
      star.style.top = Math.random() * 100 + 'vh'
      star.style.left = Math.random() * 100 + 'vw'
      star.style.opacity = Math.random()
      const duration = 2 + Math.random() * 3
      star.dataset.baseDuration = duration + 's'
      star.style.animation = `float ${duration}s infinite alternate ease-in-out`
      starContainer.appendChild(star)
    }
  }

  // Reactive Particle Logic
  let particleDebounce = null;
  function triggerReactiveParticles() {
    const stars = document.querySelectorAll('.star-particle');
    stars.forEach(s => {
      s.style.animationDuration = '0.3s';
      s.style.backgroundColor = 'var(--accent)';
      s.style.boxShadow = '0 0 10px var(--accent)';
    });

    clearTimeout(particleDebounce);
    particleDebounce = setTimeout(() => {
      stars.forEach(s => {
        s.style.animationDuration = s.dataset.baseDuration;
        s.style.backgroundColor = 'var(--star-color)';
        s.style.boxShadow = 'none';
      });
    }, 500);
  }

  // Update static UI based on language
  function updateStaticUI() {
    updateDynamicGreeting()
    const d = dict[currentLang]
    heroDesc.textContent = d.heroDesc
    searchInput.placeholder = d.searchPlaceholder
    document.querySelector('.logo h1').textContent = d.logoTitle
    footerText.innerHTML = d.footerText
    randomText.textContent = d.randomBtnText
    submitStoryText.textContent = d.submitStory
    document.title = currentLang === 'en' ? "Realm of Feelings - Notes & Reflections" : "Ruang Rasa - Catatan & Refleksi"

    document.getElementById('btnSaved').innerHTML = `<i class="fa-solid fa-bookmark"></i> ${d.saved || (currentLang === 'en' ? 'Saved' : 'Tersimpan')}`

    // Update genre buttons
    genreBtns.forEach(btn => {
      const genre = btn.dataset.genre
      if (genre !== 'saved') {
        btn.textContent = d.genres[genre] || d.genres.lain
      }
    })

    const hlTitle = document.getElementById('highlightTitleText')
    if (hlTitle) hlTitle.textContent = d.dailyHighlight

    const mtTitle = document.getElementById('moodWidgetTitle')
    if (mtTitle) mtTitle.textContent = d.moodTitle

    const statTimeLabel = document.getElementById('statTimeLabel')
    if (statTimeLabel) statTimeLabel.textContent = d.statsTime

    const statReadLabel = document.getElementById('statReadLabel')
    if (statReadLabel) statReadLabel.textContent = d.statsRead

    const moodBtns = document.querySelectorAll('.mood-btn')
    moodBtns.forEach(btn => {
      const mx = btn.dataset.mood
      if (d.moods[mx]) btn.textContent = d.moods[mx]
    })

    // Update highlight UI if it exists
    renderDailyHighlight(true) // force text update silently

    const preloaderText = document.querySelector('.preloader-text')
    if (preloaderText) preloaderText.textContent = currentLang === 'en' ? "Diving into feelings..." : "Menyelami dimensi rasa..."

    document.getElementById('letGoBtnText').textContent = d.letGoBtn
    document.getElementById('letGoTitle').textContent = d.letGoTitle
    document.getElementById('letGoDesc').textContent = d.letGoDesc
    document.getElementById('letGoInput').placeholder = currentLang === 'en' ? "Type here..." : "Ketik di sini..."
    document.getElementById('burnText').textContent = d.burnText
    document.getElementById('btnCatatanku').innerHTML = `<i class="fa-solid fa-pen"></i> ${d.myNotes}`
    const writeNoteBtnTextE = document.getElementById('writeNoteBtnText')
    if (writeNoteBtnTextE) writeNoteBtnTextE.textContent = currentLang === 'en' ? "Write a Note" : "Tulis Catatan"
    document.getElementById('writeNoteModalTitle').textContent = d.writeNoteTitle
    document.getElementById('noteTitleInput').placeholder = currentLang === 'en' ? "Note Title..." : "Judul Catatan..."
    document.getElementById('noteContentInput').placeholder = currentLang === 'en' ? "Pour your heart out here..." : "Tuliskan isi hatimu di sini..."
    document.getElementById('saveNoteText').textContent = d.saveNoteText
    const btnBottleE = document.getElementById('bottleBtnText')
    if (btnBottleE) btnBottleE.textContent = d.bottleBtn
    const titleBottleE = document.getElementById('bottleTitle')
    if (titleBottleE) titleBottleE.textContent = d.bottleTitle
    const descBottleE = document.getElementById('bottleDesc')
    if (descBottleE) descBottleE.textContent = d.bottleDesc
    const inputBottleE = document.getElementById('bottleInput')
    if (inputBottleE) inputBottleE.placeholder = currentLang === 'en' ? "Type a short message..." : "Ketik pesan singkat..."
    const throwBottleE = document.getElementById('throwBottleText')
    if (throwBottleE) throwBottleE.textContent = d.throwBottle
    const backupNotesE = document.getElementById('backupNotesText')
    if (backupNotesE) backupNotesE.textContent = d.backupNotes

    const noteDisclaimer = document.getElementById('noteDisclaimer')
    if (noteDisclaimer) {
      noteDisclaimer.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent);"></i> ${currentLang === 'en' ? 'This note is kept purely on your device. If you clear browser data, it will be lost forever.' : 'Tulisan ini murni disimpan di perangkatmu saja. Jika kamu menghapus data browser, catatan ini akan hilang selamanya.'}`
    }
  }

  // Constellation Background
  const cvs = document.getElementById('constellationCanvas')
  const ctx = cvs ? cvs.getContext('2d') : null
  let starsData = []

  if (cvs && ctx) {
    function resizeCvs() {
      cvs.width = window.innerWidth
      cvs.height = window.innerHeight
    }
    window.addEventListener('resize', resizeCvs)
    resizeCvs()

    for (let i = 0; i < 150; i++) {
      starsData.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2
      })
    }

    let mx = -1000, my = -1000
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY })

    function drawConstellations() {
      ctx.clearRect(0, 0, cvs.width, cvs.height)
      ctx.lineWidth = 0.5
      for (let i = 0; i < starsData.length; i++) {
        let s = starsData[i]
        s.x += s.vx
        s.y += s.vy
        if (s.x < 0) s.x = cvs.width
        if (s.x > cvs.width) s.x = 0
        if (s.y < 0) s.y = cvs.height
        if (s.y > cvs.height) s.y = 0

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.beginPath()
        ctx.arc(s.x, s.y, 1, 0, Math.PI * 2)
        ctx.fill()

        let dx = mx - s.x
        let dy = my - s.y
        let dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 150})`
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(mx, my)
          ctx.stroke()
        }

        for (let j = i + 1; j < starsData.length; j++) {
          let s2 = starsData[j]
          let dx2 = s.x - s2.x
          let dy2 = s.y - s2.y
          let dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (dist2 < 80) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(255, 255, 255, ${(1 - dist2 / 80) * 0.2})`
            ctx.moveTo(s.x, s.y)
            ctx.lineTo(s2.x, s2.y)
            ctx.stroke()
          }
        }
      }
      requestAnimationFrame(drawConstellations)
    }
    drawConstellations()
  }

  function showToast(msg) {
    let toast = document.getElementById('toastMsg')
    if (!toast) {
      toast = document.createElement('div')
      toast.id = 'toastMsg'
      toast.className = 'toast'
      document.body.appendChild(toast)
    }
    toast.textContent = msg
    toast.classList.add('show')
    setTimeout(() => toast.classList.remove('show'), 3000)
  }

  // Smooth Audio Fader
  function fadeAudio(audio, targetVolume, durationInMs, onComplete) {
    if (!audio) return
    const step = 50
    const volumeChange = (targetVolume - audio.volume) / (durationInMs / step)

    // Clear any existing fades
    if (audio.fadeInterval) clearInterval(audio.fadeInterval)

    // Play immediately if fading up from 0
    if (targetVolume > 0 && audio.paused) {
      audio.volume = 0;
      audio.play().catch(e => console.log('Audio tracking interaction issue', e))
    }

    audio.fadeInterval = setInterval(() => {
      let newVolume = audio.volume + volumeChange
      if ((volumeChange > 0 && newVolume >= targetVolume) || (volumeChange < 0 && newVolume <= targetVolume)) {
        audio.volume = targetVolume
        clearInterval(audio.fadeInterval)
        if (targetVolume === 0) audio.pause()
        if (onComplete) onComplete()
      } else {
        audio.volume = newVolume
      }
    }, step)
  }

  // Audio Logic (Auto-loop Playlist)
  const audioToggle = document.getElementById('audioToggle')
  const bgMusic = document.getElementById('bgMusic')
  let bgTargetVolume = 0.4

  const bgMusicVolumeSlider = document.getElementById('bgMusicVolume')
  if (bgMusicVolumeSlider) {
    bgMusicVolumeSlider.addEventListener('input', (e) => {
      bgTargetVolume = parseFloat(e.target.value)
      if (isPlaying && bgMusic) bgMusic.volume = bgTargetVolume
    })
  }

  const playlist = [
    "https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3",
    "https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3",
    "https://assets.mixkit.co/music/preview/mixkit-piano-horror-671.mp3"
  ]
  let currentTrackIdx = 0

  if (bgMusic) {
    bgMusic.volume = bgTargetVolume
    bgMusic.src = playlist[currentTrackIdx]
    bgMusic.loop = false

    bgMusic.addEventListener('ended', () => {
      currentTrackIdx = (currentTrackIdx + 1) % playlist.length
      bgMusic.src = playlist[currentTrackIdx]
      bgMusic.play().catch(e => console.log(e))
    })
  }

  audioToggle.addEventListener('click', () => {
    if (isPlaying) {
      fadeAudio(bgMusic, 0, 1500, () => {
        audioToggle.innerHTML = '<i class="fa-solid fa-music"></i>'
        audioToggle.classList.remove('playing')
      })
    } else {
      audioToggle.innerHTML = '<i class="fa-solid fa-pause"></i>'
      audioToggle.classList.add('playing')
      fadeAudio(bgMusic, bgTargetVolume, 2000)
    }
    isPlaying = !isPlaying
  })

  // Rain Logic
  const rainToggle = document.getElementById('rainToggle')
  const rainMusic = document.getElementById('rainMusic')
  let rainTargetVolume = 0.5
  let isRainPlaying = false
  if (rainMusic) rainMusic.volume = rainTargetVolume

  const rainVolumeSlider = document.getElementById('rainVolume')
  if (rainVolumeSlider) {
    rainVolumeSlider.addEventListener('input', (e) => {
      rainTargetVolume = parseFloat(e.target.value)
      if (isRainPlaying && rainMusic) rainMusic.volume = rainTargetVolume
    })
  }

  rainToggle.addEventListener('click', () => {
    if (isRainPlaying) {
      fadeAudio(rainMusic, 0, 1500, () => {
        rainToggle.style.color = 'var(--text-muted)'
        rainToggle.classList.remove('playing')
      })
    } else {
      rainToggle.style.color = 'var(--accent)'
      rainToggle.classList.add('playing')
      fadeAudio(rainMusic, rainTargetVolume, 2000)
    }
    isRainPlaying = !isRainPlaying
  })

  // Zen Mode Logic
  const zenToggle = document.getElementById('zenToggle')
  let isZenMode = false
  zenToggle.addEventListener('click', () => {
    isZenMode = !isZenMode
    if (isZenMode) {
      document.body.classList.add('zen-mode')
      zenToggle.style.color = 'var(--accent)'
      zenToggle.innerHTML = '<i class="fa-solid fa-eye"></i>'
      showToast(currentLang === 'en' ? 'Zen Mode activated' : 'Mode Fokus diaktifkan')
      document.getElementById('breathingGuide').style.display = 'flex'
    } else {
      document.body.classList.remove('zen-mode')
      zenToggle.style.color = 'var(--text-muted)'
      zenToggle.innerHTML = '<i class="fa-solid fa-eye-slash"></i>'
      document.getElementById('breathingGuide').style.display = 'none'
    }
  })


  // Font Size Logic
  const fontToggle = document.getElementById('fontToggle')
  let currentFontSizeLevel = 0
  const fontSizes = ['1.15rem', '1.35rem', '1.55rem']
  const lineHeights = ['1.8', '1.9', '2.0']

  fontToggle.addEventListener('click', () => {
    currentFontSizeLevel = (currentFontSizeLevel + 1) % fontSizes.length
    const twContainer = document.getElementById('typewriterContainer')
    if (twContainer) {
      twContainer.style.fontSize = fontSizes[currentFontSizeLevel]
      twContainer.style.lineHeight = lineHeights[currentFontSizeLevel]
    }
  })

  // Modal Lang Toggle
  const langToggleModal = document.getElementById('langToggleModal')
  if (langToggleModal) {
    langToggleModal.addEventListener('click', () => {
      if (currentLang === 'en') {
        currentLang = 'id'
        btnId.classList.add('active')
        btnEn.classList.remove('active')
      } else {
        currentLang = 'en'
        btnEn.classList.add('active')
        btnId.classList.remove('active')
      }

      updateStaticUI()
      renderItems()
      renderDailyHighlight(true)

      // Re-render currently opened modal item directly
      if (activeStoryId !== null) {
        const item = reflections.find(r => r.id === activeStoryId)
        if (item) {
          openModal(item)
          // Maintain font sizing across re-render
          const twContainer = document.getElementById('typewriterContainer')
          if (twContainer && currentFontSizeLevel > 0) {
            twContainer.style.fontSize = fontSizes[currentFontSizeLevel]
            twContainer.style.lineHeight = lineHeights[currentFontSizeLevel]
          }
        }
      }
    })
  }

  // Theme Logic
  const themeToggle = document.getElementById('themeToggle')
  const themes = ['midnight', 'dawn', 'dusk']
  const themeIcons = {
    'midnight': '<i class="fa-solid fa-moon"></i>',
    'dawn': '<i class="fa-solid fa-sun"></i>',
    'dusk': '<i class="fa-solid fa-cloud-sun"></i>'
  }

  function applyTheme(theme) {
    document.body.className = ''
    if (theme !== 'midnight') {
      document.body.classList.add('theme-' + theme)
    }
    themeToggle.innerHTML = themeIcons[theme]
  }

  // Set initial theme
  applyTheme(currentTheme)

  // Header Scroll Animation
  const glassHeader = document.querySelector('.glass-header')
  if (glassHeader) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        glassHeader.classList.add('scrolled')
      } else {
        glassHeader.classList.remove('scrolled')
      }
    })
  }

  themeToggle.addEventListener('click', () => {
    let currIdx = themes.indexOf(currentTheme)
    currentTheme = themes[(currIdx + 1) % themes.length]
    applyTheme(currentTheme)
  })

  // Language Toggles
  btnEn.addEventListener('click', () => {
    if (currentLang === 'en') return
    currentLang = 'en'
    btnEn.classList.add('active')
    btnId.classList.remove('active')
    updateStaticUI()
    refreshCurrentView()
  })

  btnId.addEventListener('click', () => {
    if (currentLang === 'id') return
    currentLang = 'id'
    btnId.classList.add('active')
    btnEn.classList.remove('active')
    updateStaticUI()
    refreshCurrentView()
  })

  // Secret Category Logic
  const logo = document.querySelector('.logo')
  const btnSecret = document.getElementById('btnSecret')
  let logoClicks = 0
  let logoClickTimer = null

  logo.style.cursor = 'pointer'
  logo.addEventListener('click', () => {
    logoClicks++
    if (logoClicks >= 5) {
      btnSecret.style.display = 'inline-block'
      showToast(currentLang === 'en' ? 'Secret category unlocked!' : 'Kategori rahasia terbuka!')
      logoClicks = 0
    }
    clearTimeout(logoClickTimer)
    logoClickTimer = setTimeout(() => {
      logoClicks = 0
    }, 2000)
  })

  // Randomizer
  let lastSecretId = null
  btnRandom.addEventListener('click', () => {
    let pool = reflections

    // 15% chance for a secret item
    if (Math.random() < 0.15) {
      const secrets = reflections.filter(r => r.genre === 'secret')
      if (secrets.length > 0) pool = secrets
    } else {
      pool = reflections.filter(r => r.genre !== 'secret')
    }

    let randomItem
    do {
      const randomIndex = Math.floor(Math.random() * pool.length)
      randomItem = pool[randomIndex]
    } while (pool.length > 1 && randomItem.id === lastSecretId)

    lastSecretId = randomItem.id
    openModal(randomItem)
  })

  function refreshCurrentView() {
    const activeGenre = document.querySelector('.genre-btn.active').dataset.genre
    filterItems(searchInput.value, activeGenre)

    // update modal if it's currently open
    if (modal.classList.contains('show')) {
      // A quick hack is to just re-render the modal body with the currently focused item from DOM data
      // But since we didn't store current item tightly, closing it or ignoring background update is simpler.
      // Here we'll just close it to be safe and clean.
      closeModal()
    }
  }

  // Helper to extract correct lang data
  function getItemData(item) {
    return currentLang === 'en' ? item.enContent : item.idContent
  }

  // Render items
  function renderItems(items) {
    grid.innerHTML = ''
    const d = dict[currentLang]

    if (items.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 1.2rem; padding: 3rem;">
        ${d.empty}
      </div>`
      return
    }

    items.forEach((item, index) => {
      const contentData = getItemData(item)
      const delay = (index % 10) * 0.1
      const cardEl = document.createElement('div')
      cardEl.className = 'poem-card fade-in'
      cardEl.style.animationDelay = `${delay}s`

      let isLocked = false;
      if (item.unlockDate && new Date(item.unlockDate).getTime() > Date.now()) {
        isLocked = true;
      }

      cardEl.onclick = () => {
        if (isLocked) {
          showToast(currentLang === 'en' ? `Locked until ${new Date(item.unlockDate).toLocaleDateString()}` : `Tergembok hingga ${new Date(item.unlockDate).toLocaleDateString()}`)
          playAudioCue('paper')
          return
        }
        openModal(item)
      }

      const excerptLines = contentData.content.split('\n').filter(Boolean)
      const excerpt = isLocked ? (currentLang === 'en' ? 'Time capsule is securely locked...' : 'Kapsul waktu rahasia masih terkunci rapat...') : (excerptLines[0] ? excerptLines[0].substring(0, 100) + '...' : '...')
      const titleHTML = isLocked ? `<i class="fa-solid fa-lock" style="color:var(--text-muted); font-size:0.9rem; margin-right:5px;"></i> ${contentData.title}` : contentData.title

      const genreLabel = d.genres[item.genre] || (item.genre === 'secret' ? '???' : d.genres.lain)
      const isSaved = savedIds.includes(item.id)

      let readTimeHTML = `<div class="read-time" id="rt-${item.id}" style="${storyReadTimes[item.id] ? '' : 'display:none;'}">`;
      if (storyReadTimes[item.id]) {
        const tr = storyReadTimes[item.id];
        const m = Math.floor(tr / 60);
        const s = tr % 60;
        const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
        readTimeHTML += `<i class="fa-regular fa-clock" title="Read Time"></i> ${timeStr}`;
      } else {
        readTimeHTML += ``;
      }
      readTimeHTML += `</div>`;

      let deleteHTML = '';
      if (item.genre === 'catatanku') {
        const titleDelete = currentLang === 'en' ? 'Delete Note' : 'Hapus Catatan';
        deleteHTML = `
           <button class="save-btn" title="${titleDelete}" data-id="${item.id}" onclick="event.stopPropagation(); deleteNote(${item.id}, event)">
             <i class="fa-solid fa-trash-can" style="color:var(--text-muted); opacity: 0.7;"></i>
           </button>
        `;
      }

      cardEl.innerHTML = `
        <div class="poem-header">
           <span class="genre-tag">${genreLabel}</span>
           <div style="display: flex; gap: 0.5rem; align-items: center;">
             ${deleteHTML}
             <button class="save-btn ${isSaved ? 'saved' : ''}" data-id="${item.id}" onclick="event.stopPropagation(); toggleSave(${item.id}, event)">
               <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
             </button>
           </div>
        </div>
        <h3>${titleHTML}</h3>
        ${readTimeHTML}
        <div class="poem-excerpt">${excerpt}</div>
      `

      grid.appendChild(cardEl)
    })
  }

  // Make toggleSave global for onclick
  window.deleteNote = (id, event) => {
    let myNotesRaw = JSON.parse(localStorage.getItem('rof_my_notes') || '[]')
    myNotesRaw = myNotesRaw.filter(n => n.id !== id)
    localStorage.setItem('rof_my_notes', JSON.stringify(myNotesRaw))
    showToast(currentLang === 'en' ? 'Note deleted.' : 'Catatan telah dihapus.')
    playAudioCue('paper')
    refreshCurrentView()
  }

  window.toggleSave = (id, event) => {
    // Add burst animation
    if (event && event.currentTarget) {
      event.currentTarget.classList.remove('burst')
      void event.currentTarget.offsetWidth // trigger reflow
      event.currentTarget.classList.add('burst')
    }

    if (savedIds.includes(id)) {
      savedIds = savedIds.filter(savedId => savedId !== id)
    } else {
      savedIds.push(id)
      playAudioCue('chime')
    }
    localStorage.setItem('rof_saved', JSON.stringify(savedIds))
    refreshCurrentView()
  }

  // Filtering
  genreBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Manage active class
      genreBtns.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      const genre = btn.dataset.genre
      playAudioCue('swoosh')
      filterItems(searchInput.value, genre)
    })
  })

  // Searching
  searchInput.addEventListener('input', (e) => {
    const activeGenre = document.querySelector('.genre-btn.active').dataset.genre
    filterItems(e.target.value, activeGenre)
  })

  function filterItems(query, genre) {
    // Hide 'secret' items from the public grid
    let filtered = reflections.filter(p => p.genre !== 'secret')

    // Provide My Notes
    let myNotesRaw = JSON.parse(localStorage.getItem('rof_my_notes') || '[]')
    let myNotesFormatted = myNotesRaw.map(n => ({
      id: n.id,
      genre: 'catatanku',
      unlockDate: n.unlockDate || null,
      enContent: { title: n.title, content: n.content, fact: '' },
      idContent: { title: n.title, content: n.content, fact: '' }
    }))

    // filter genre
    if (genre === 'saved') {
      filtered = reflections.filter(p => savedIds.includes(p.id))
    } else if (genre === 'catatanku') {
      filtered = myNotesFormatted
    } else if (genre !== 'all') {
      filtered = filtered.filter(p => p.genre === genre)
    }

    if (genre === 'all') {
      filtered = [...filtered, ...myNotesFormatted]
    }

    // Adaptive Audio Soundscapes logic
    if (bgMusic && isPlaying) {
      if (genre === 'kesepian' || genre === 'malamhari') {
        bgMusic.playbackRate = 0.8
        bgMusic.volume = 0.3
        if (!isRainPlaying) {
          rainToggle.click(); // turn on rain automatically for these genres
        }
      } else if (genre === 'hubungan' || genre === 'keluarga') {
        bgMusic.playbackRate = 1.0
        bgMusic.volume = 0.4
      } else if (genre === 'secret') {
        bgMusic.playbackRate = 0.6
        bgMusic.volume = 0.2
      } else {
        bgMusic.playbackRate = 1.0
        bgMusic.volume = bgTargetVolume
      }
    }

    // filter query
    if (query) {
      const lowerQuery = query.toLowerCase()
      filtered = filtered.filter(p => {
        const data = getItemData(p)
        return data.title.toLowerCase().includes(lowerQuery) ||
          p.author.toLowerCase().includes(lowerQuery) ||
          data.content.toLowerCase().includes(lowerQuery)
      })
    }

    currentFilteredItems = filtered
    if (genre === 'catatanku') {
      grid.classList.add('timeline-view')
    } else {
      grid.classList.remove('timeline-view')
    }
    renderItems(filtered)
  }

  // Expose to window for inline onclicks
  window.openModalById = (id) => {
    let item = reflections.find(r => r.id === id)
    if (!item) {
      let myNotes = JSON.parse(localStorage.getItem('rof_my_notes') || '[]')
      let n = myNotes.find(x => x.id === id)
      if (n) {
        item = {
          id: n.id,
          genre: 'catatanku',
          author: currentLang === 'en' ? 'Me' : 'Saya',
          enContent: { title: n.title, content: n.content, fact: '' },
          idContent: { title: n.title, content: n.content, fact: '' }
        }
      }
    }
    if (item) openModal(item)
  }

  // Modal logic
  function openModal(item) {
    playAudioCue('paper')
    const d = dict[currentLang]
    const contentData = getItemData(item)

    // Break paragraphs properly
    const paragraphs = contentData.content.split('\n\n').map(p => `<p class="prose-paragraph">${p}</p>`).join('')
    const isSaved = savedIds.includes(item.id)
    const shareUrl = window.location.origin + window.location.pathname + '?id=' + item.id

    // Nav logic
    const currentIndex = currentFilteredItems.findIndex(p => p.id === item.id)
    const prevItem = currentIndex > 0 ? currentFilteredItems[currentIndex - 1] : null
    const nextItem = currentIndex !== -1 && currentIndex < currentFilteredItems.length - 1 ? currentFilteredItems[currentIndex + 1] : null

    modalBody.innerHTML = `
      <h2 class="full-poem-title">${contentData.title}</h2>
      <div class="typewriter-hint" id="twHint"><i class="fa-solid fa-hand-pointer"></i> Klik layar untuk menampilkan semua teks</div>
      <div class="full-poem-content prose-content" id="typewriterContainer" style="cursor: pointer;"></div>
      ${contentData.fact ? `
        <div class="poem-fact">
          <i class="fa-solid fa-lightbulb"></i>
          <div>
            <strong>${d.factTitle}</strong>
            <p>${contentData.fact}</p>
          </div>
        </div>
      ` : ''}
      <div class="modal-actions">
        <div class="modal-actions-left">
           <button class="action-btn tts-btn" title="Read Aloud">
              <i class="fa-solid fa-headphones"></i>
           </button>
           <button class="action-btn" id="modalSaveBtn" data-id="${item.id}" title="${d.saved || 'Save'}">
              <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
           </button>
           <button class="action-btn export-story-btn" title="Download IG Story">
              <i class="fa-solid fa-mobile-screen"></i>
           </button>
           <button class="action-btn export-square-btn" title="Download IG Post">
              <i class="fa-brands fa-instagram"></i>
           </button>
        </div>
        <div class="modal-actions-right">
           <button class="action-btn share-copy-btn" title="Copy Link" data-url="${shareUrl}">
              <i class="fa-solid fa-link"></i>
           </button>
           <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(contentData.title + ' - ')}" target="_blank" class="action-btn" title="Share to X">
              <i class="fa-brands fa-x-twitter"></i>
           </a>
           <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(contentData.title + ' ' + shareUrl)}" target="_blank" class="action-btn" title="Share to WhatsApp">
              <i class="fa-brands fa-whatsapp"></i>
           </a>
        </div>
      </div>
      <div class="modal-nav-actions">
        ${prevItem ? `<button class="nav-btn" onclick="window.openModalById(${prevItem.id})"><i class="fa-solid fa-arrow-left"></i> ${currentLang === 'en' ? 'Prev Story' : 'Cerita Sebelumnya'}</button>` : '<div></div>'}
        ${nextItem ? `<button class="nav-btn" onclick="window.openModalById(${nextItem.id})">${currentLang === 'en' ? 'Next Story' : 'Cerita Selanjutnya'} <i class="fa-solid fa-arrow-right"></i></button>` : '<div></div>'}
      </div>
    `
    modal.style.display = 'flex'

    // Typewriter logic
    skipTypewriter = false
    clearTimeout(typewriterTimeout)
    const twContainer = document.getElementById('typewriterContainer')
    const twHint = document.getElementById('twHint')
    twContainer.innerHTML = ''
    twContainer.style.fontSize = fontSizes[currentFontSizeLevel]
    twContainer.style.lineHeight = lineHeights[currentFontSizeLevel]

    // Hide Fact initially
    const factEl = document.querySelector('.poem-fact')
    if (factEl) factEl.style.display = 'none'

    let pIdx = 0
    let cIdx = 0
    const paragraphsData = contentData.content.split('\n\n').filter(Boolean)
    let currentP = document.createElement('p')
    currentP.className = 'prose-paragraph'
    twContainer.appendChild(currentP)

    function typeNext() {
      if (skipTypewriter) {
        twContainer.innerHTML = paragraphs
        if (factEl) { factEl.style.display = 'flex'; factEl.style.animation = 'none'; }
        if (twHint) twHint.style.display = 'none'
        return
      }

      if (pIdx < paragraphsData.length) {
        let currentText = paragraphsData[pIdx]
        if (cIdx < currentText.length) {
          currentP.innerHTML += currentText[cIdx]
          cIdx++
          // scroll to bottom of modal if typing goes below viewport?
          // modal.scrollTop = modal.scrollHeight
          typewriterTimeout = setTimeout(typeNext, 25)
        } else {
          pIdx++
          cIdx = 0
          if (pIdx < paragraphsData.length) {
            currentP = document.createElement('p')
            currentP.className = 'prose-paragraph'
            twContainer.appendChild(currentP)
            typewriterTimeout = setTimeout(typeNext, 400)
          } else {
            // Done typing
            if (factEl) { factEl.style.display = 'flex'; factEl.style.animation = 'fadeIn 0.8s ease forwards'; }
            if (twHint) twHint.style.display = 'none'
            skipTypewriter = true
          }
        }
      }
    }
    typewriterTimeout = setTimeout(typeNext, 500)

    twContainer.addEventListener('click', () => { skipTypewriter = true })
    twHint.addEventListener('click', () => { skipTypewriter = true })

    // Attach event listeners for dynamic buttons inside modal
    document.getElementById('modalSaveBtn').addEventListener('click', (e) => {
      window.toggleSave(item.id, e)
      const currentlySaved = savedIds.includes(item.id)
      e.currentTarget.innerHTML = `<i class="${currentlySaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>`
    })

    document.querySelector('.share-copy-btn').addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.url
      navigator.clipboard.writeText(url).then(() => {
        showToast(d.copied)
      })
    })

    const runExport = async (mode) => {
      showToast(d.exporting)
      const exportFrame = document.getElementById('exportFrame')

      // Setup Frame
      exportFrame.className = 'export-frame mode-' + mode
      document.getElementById('exportTitle').textContent = contentData.title
      document.getElementById('exportAuthor').innerHTML = `${d.by} ${item.author}`
      document.getElementById('exportContent').innerHTML = paragraphs

      // Give DOM time to update visually
      await new Promise(res => setTimeout(res, 100))

      try {
        const canvas = await html2canvas(exportFrame, {
          scale: 2, // Hi-Res
          backgroundColor: getComputedStyle(document.body).getPropertyValue('--dark-bg').trim()
        })

        const link = document.createElement('a')
        link.download = `ruangrasa-${mode}-${item.id}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      } catch (err) {
        console.error('Export failed:', err)
        showToast('Export failed.')
      }
    }

    document.querySelector('.export-story-btn').addEventListener('click', () => runExport('story'))
    document.querySelector('.export-square-btn').addEventListener('click', () => runExport('square'))

    // Setup Text-to-Speech (TTS) feature
    const ttsBtn = document.querySelector('.tts-btn');
    if (ttsBtn && 'speechSynthesis' in window) {
      ttsBtn.onclick = () => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          ttsBtn.innerHTML = '<i class="fa-solid fa-headphones"></i>';
          ttsBtn.classList.remove('burst');
          return;
        }

        playAudioCue('swoosh');
        ttsBtn.classList.add('burst');
        ttsBtn.innerHTML = '<i class="fa-regular fa-circle-stop"></i>';

        const utterance = new SpeechSynthesisUtterance(paragraphsData.join(' '));
        utterance.lang = currentLang === 'en' ? 'en-US' : 'id-ID';
        utterance.rate = 0.95;
        utterance.pitch = 0.9;

        utterance.onend = () => {
          ttsBtn.innerHTML = '<i class="fa-solid fa-headphones"></i>';
          ttsBtn.classList.remove('burst');
        };

        window.speechSynthesis.speak(utterance);
      };
    } else if (ttsBtn) {
      ttsBtn.style.display = 'none'; // unsupported
    }

    // Reset scroll position to top
    modal.scrollTop = 0
    // Delay adding show to trigger css transition properly
    setTimeout(() => {
      modal.classList.add('show')
    }, 10)

    document.body.style.overflow = 'hidden'
  }

  function closeModal() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    activeStoryId = null
    clearTimeout(typewriterTimeout)
    skipTypewriter = true
    modal.classList.remove('show')
    setTimeout(() => {
      modal.style.display = 'none'
      document.body.style.overflow = 'auto'
    }, 400) // matches css transition duration
  }

  closeBtn.addEventListener('click', closeModal)

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal()
    }
  })

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeModal()
    }
  })

  // Touch Swipe Logic for Modal
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  modal.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  modal.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    if (!modal.classList.contains('show')) return;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);

    // Ignore small swipes (accidental touches)
    if (Math.max(absDiffX, absDiffY) < 50) return;

    if (absDiffY > absDiffX) {
      // Vertical swipe
      if (diffY > 80) { // Swiped down
        closeModal();
      }
    } else {
      // Horizontal swipe
      const currentIndex = currentFilteredItems.findIndex(p => p.id === activeStoryId);
      if (currentIndex === -1) return;

      if (diffX > 60) {
        // Swiped right (Prev Story)
        if (currentIndex > 0) {
          window.openModalById(currentFilteredItems[currentIndex - 1].id);
        }
      } else if (diffX < -60) {
        // Swiped left (Next Story)
        if (currentIndex < currentFilteredItems.length - 1) {
          window.openModalById(currentFilteredItems[currentIndex + 1].id);
        }
      }
    }
  }

  // Handle URL ID if sharing
  const urlParams = new URLSearchParams(window.location.search);
  const sharedId = urlParams.get('id');

  // Initial trigger
  updateStaticUI()
  filterItems('', 'all')

  if (sharedId) {
    const sharedItem = reflections.find(r => r.id === parseInt(sharedId))
    if (sharedItem) {
      setTimeout(() => openModal(sharedItem), 300)
    }
  }

  // Mouse Parallax for Stars
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight

    const stars1 = document.getElementById('stars')
    const stars2 = document.getElementById('stars2')
    const stars3 = document.getElementById('stars3')

    if (stars1) stars1.style.transform = `translate(-${x * 20}px, -${y * 20}px)`
    if (stars2) stars2.style.transform = `translate(-${x * 40}px, -${y * 40}px)`
    if (stars3) stars3.style.transform = `translate(-${x * 60}px, -${y * 60}px)`
  })

  // Reading Progress Bar
  modal.addEventListener('scroll', () => {
    const progressBar = document.getElementById('readingProgressBar')
    if (progressBar && modal.classList.contains('show')) {
      const scrollHeight = modal.scrollHeight - modal.clientHeight
      const scrolled = (modal.scrollTop / scrollHeight) * 100
      progressBar.style.width = `${scrolled}%`
    }
  })

  // Preloader Logic
  window.addEventListener('load', () => {
    setTimeout(() => {
      const preloader = document.getElementById('preloader')
      if (preloader) {
        preloader.classList.add('fade-out')
        setTimeout(() => {
          preloader.style.display = 'none'
        }, 1500)
      }
    }, 1000)
  })

  // === NEW FEATURES LOGIC ===

  // 1. Daily Highlight Logic
  function renderDailyHighlight(isLangUpdate = false) {
    const highlightSection = document.getElementById('highlightSection')
    const placeholder = document.getElementById('highlightCardPlaceholder')
    if (!highlightSection || !placeholder) return

    // Show highlight only on All genre / not searching
    const activeGenre = document.querySelector('.genre-btn.active').dataset.genre
    if ((activeGenre !== 'all' && activeGenre !== 'saved') || searchInput.value.trim() !== '') {
      highlightSection.style.display = 'none'
      return
    }

    highlightSection.style.display = 'flex'

    // We use a deterministic random index based on current date
    const todayStr = new Date().toDateString()
    let hash = 0
    for (let i = 0; i < todayStr.length; i++) {
      hash = todayStr.charCodeAt(i) + ((hash << 5) - hash)
    }
    const publicReflections = reflections.filter(r => r.genre !== 'secret')
    const dailyIndex = Math.abs(hash) % publicReflections.length
    const dailyItem = publicReflections[dailyIndex]

    const d = dict[currentLang]
    const contentData = getItemData(dailyItem)
    const excerptLines = contentData.content.split('\\n').filter(Boolean)
    const excerpt = excerptLines[0].substring(0, 100) + '...'
    const genreLabel = d.genres[dailyItem.genre] || d.genres.lain
    const isSaved = savedIds.includes(dailyItem.id)

    let readTimeHTML = `<div class="read-time" id="rt-${dailyItem.id}" style="${storyReadTimes[dailyItem.id] ? '' : 'opacity:0;'}">`;
    if (storyReadTimes[dailyItem.id]) {
      const tr = storyReadTimes[dailyItem.id];
      const m = Math.floor(tr / 60);
      const s = tr % 60;
      const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
      readTimeHTML += `<i class="fa-regular fa-clock"></i> ${timeStr} ${d.readTime}`;
    } else {
      readTimeHTML += `<i class="fa-regular fa-clock"></i> 0s ${d.readTime}`;
    }
    readTimeHTML += `</div>`;

    const cardHTML = `
      <div class="poem-card" style="animation: none;" onclick="window.openModalById(${dailyItem.id})">
        <div class="poem-header">
           <span class="genre-tag">${genreLabel}</span>
           <button class="save-btn ${isSaved ? 'saved' : ''}" data-id="${dailyItem.id}" onclick="event.stopPropagation(); toggleSave(${dailyItem.id}, event)">
             <i class="${isSaved ? 'fa-solid' : 'fa-regular'} fa-heart"></i>
           </button>
        </div>
        <h3 style="font-size: 1.4rem; color: var(--accent);">${contentData.title}</h3>
        ${readTimeHTML}
        <div class="poem-excerpt" style="font-size: 1.05rem; margin-top: 10px;">${excerpt}</div>
      </div>
    `
    placeholder.innerHTML = cardHTML
  }

  // Hook renderDailyHighlight to filterItems as well
  const originalFilterItems = filterItems;
  // Monkeypatch the internal filter items to also update the highlight display
  searchInput.addEventListener('input', () => renderDailyHighlight())
  genreBtns.forEach(btn => btn.addEventListener('click', () => renderDailyHighlight()))
  renderDailyHighlight() // initial call

  // 2. Mood Widget Logic
  const moodBtn = document.getElementById('moodWidgetBtn')
  const moodPanel = document.getElementById('moodWidgetPanel')
  if (moodBtn && moodPanel) {
    moodBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      moodPanel.classList.toggle('open')
    })
    document.addEventListener('click', (e) => {
      if (!moodPanel.contains(e.target) && e.target !== moodBtn) {
        moodPanel.classList.remove('open')
      }
    })

    const moodMap = {
      'sedih': ['kesepian', 'kenyataan'],
      'lelah': ['kehidupan', 'kenyataan'],
      'overthinking': ['malamhari', 'dirisendiri'],
      'hancur': ['hubungan', 'masalalu'],
      'sepi': ['kesepian', 'malamhari']
    }

    const moodButtons = document.querySelectorAll('.mood-btn')
    moodButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        moodPanel.classList.remove('open')
        const moodType = btn.dataset.mood

        // Log to heatmap
        const todayStr = new Date().toISOString().split('T')[0]
        let moodHistory = JSON.parse(localStorage.getItem('rof_mood_history') || '{}')
        moodHistory[todayStr] = moodType
        localStorage.setItem('rof_mood_history', JSON.stringify(moodHistory))

        const mappedGenres = moodMap[moodType] || ['kehidupan']

        // Find reflections matching those genres
        let candidates = reflections.filter(r => mappedGenres.includes(r.genre))
        if (candidates.length === 0) candidates = reflections.filter(r => r.genre !== 'secret')

        const randomRec = candidates[Math.floor(Math.random() * candidates.length)]
        if (randomRec) openModal(randomRec)
      })
    })
  }

  // 3. Contemplation Stats UI
  const statsUI = document.getElementById('statsUI')
  const statTimeVal = document.getElementById('statTimeVal')
  const statReadVal = document.getElementById('statReadVal')

  let timeSpentSeconds = parseInt(localStorage.getItem('rof_time_spent')) || 0
  let readStories = new Set(JSON.parse(localStorage.getItem('rof_read_stories') || '[]'))

  if (statsUI) {
    statsUI.title = currentLang === 'en' ? 'Click to show/hide details' : 'Klik untuk menyembunyikan/menampilkan';
    statsUI.addEventListener('click', () => {
      statsUI.classList.toggle('collapsed')
    })
  }

  // Unhide stats after 5 seconds to avoid distracting immediately
  setTimeout(() => {
    if (statsUI) statsUI.style.display = 'flex'
    if (statReadVal) statReadVal.textContent = readStories.size
  }, 5000)

  setInterval(() => {
    timeSpentSeconds++
    localStorage.setItem('rof_time_spent', timeSpentSeconds)

    const mins = Math.floor(timeSpentSeconds / 60)
    const secs = timeSpentSeconds % 60
    if (statTimeVal) {
      if (mins < 1) {
        statTimeVal.textContent = secs + 's'
      } else {
        statTimeVal.textContent = mins + 'm ' + secs + 's'
      }
    }

    if (activeStoryId !== null) {
      if (!storyReadTimes[activeStoryId]) storyReadTimes[activeStoryId] = 0;
      storyReadTimes[activeStoryId]++
      localStorage.setItem('rof_story_times', JSON.stringify(storyReadTimes))

      const rtEls = document.querySelectorAll('#rt-' + activeStoryId)
      rtEls.forEach(el => {
        el.style.display = 'block'
        const tr = storyReadTimes[activeStoryId]
        const m = Math.floor(tr / 60);
        const s = tr % 60;
        const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
        el.innerHTML = `<i class="fa-regular fa-clock" title="Read Time"></i> ${timeStr}`
      })
    }
  }, 1000)

  // Hook into openModal to track read stories
  const originalOpenModal = openModal
  openModal = function (item) {
    if (item && item.id) {
      activeStoryId = item.id
      readStories.add(item.id)
      localStorage.setItem('rof_read_stories', JSON.stringify([...readStories]))
      if (statReadVal) statReadVal.textContent = readStories.size
    }
    originalOpenModal(item)
  }

  // 4. Water Ripple Effect (Aesthetic click)
  document.addEventListener('mousedown', (e) => {
    const ripple = document.createElement('div')
    ripple.className = 'click-ripple'
    ripple.style.left = (e.clientX - 15) + 'px'
    ripple.style.top = (e.clientY - 15) + 'px'
    ripple.style.width = '30px'
    ripple.style.height = '30px'

    document.body.appendChild(ripple)

    setTimeout(() => {
      ripple.remove()
    }, 850) // tied to the css animation duration
  })

  // 5. Letting Go Logic
  const letGoBtn = document.getElementById('btnLetGo')
  const letGoModal = document.getElementById('letGoModal')
  const letGoInput = document.getElementById('letGoInput')
  const btnBurn = document.getElementById('btnBurn')
  const closeLetGo = document.getElementById('closeLetGo')

  if (letGoBtn) {
    // Make let go input reactive
    letGoInput.addEventListener('input', triggerReactiveParticles);

    letGoBtn.addEventListener('click', () => {
      letGoInput.value = ''
      letGoInput.className = ''
      letGoInput.style.opacity = '1'
      letGoInput.style.filter = 'none'
      letGoModal.style.display = 'flex'
      setTimeout(() => letGoModal.classList.add('show'), 10)
    })

    closeLetGo.addEventListener('click', () => {
      letGoModal.classList.remove('show')
      setTimeout(() => letGoModal.style.display = 'none', 400)
    })

    btnBurn.addEventListener('click', () => {
      if (!letGoInput.value.trim()) return;
      letGoInput.classList.add('burn-effect')

      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-camp-fire-crackling-loop-597.mp3')
      audio.volume = 0.5;
      audio.play().catch(e => console.log(e))

      // Ash Canvas Effect
      const canvas = document.getElementById('ashCanvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = letGoModal.clientWidth;
        canvas.height = letGoModal.clientHeight;

        let particles = [];
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: canvas.width / 2 + (Math.random() * 400 - 200),
            y: canvas.height / 2 + Math.random() * 100,
            size: Math.random() * 3 + 1,
            speedY: Math.random() * -4 - 1,
            speedX: Math.random() * 3 - 1.5,
            life: 255,
            decay: Math.random() * 3 + 2
          });
        }

        function animateAsh() {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          let active = false;

          particles.forEach(p => {
            if (p.life > 0) {
              active = true;
              p.y += p.speedY;
              p.x += p.speedX;
              p.life -= p.decay;

              ctx.fillStyle = `rgba(226, 85, 85, ${Math.max(0, p.life) / 255})`;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
              ctx.fill();
            }
          });

          if (active) {
            requestAnimationFrame(animateAsh);
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
        setTimeout(animateAsh, 500); // Start flying ash shortly after burn begins
      }

      setTimeout(() => {
        letGoModal.classList.remove('show')
        setTimeout(() => {
          letGoModal.style.display = 'none';
          if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }, 400)
        showToast(currentLang === 'en' ? 'Your burdens have turned to ash.' : 'Bebanmu telah hangus menjadi abu.')
      }, 2500)
    })
  }

  // 6. Private Notes Logic
  const writeNoteBtn = document.getElementById('writeNoteBtn')
  const writeNoteModal = document.getElementById('writeNoteModal')
  const closeWriteNote = document.getElementById('closeWriteNote')
  const btnSaveNote = document.getElementById('btnSaveNote')
  const noteTitleInput = document.getElementById('noteTitleInput')
  const noteContentInput = document.getElementById('noteContentInput')
  const noteUnlockDate = document.getElementById('noteUnlockDate')

  if (writeNoteBtn) {
    // Make private note input reactive
    noteContentInput.addEventListener('input', triggerReactiveParticles);

    writeNoteBtn.addEventListener('click', () => {
      noteTitleInput.value = ''
      noteContentInput.value = ''
      if (noteUnlockDate) noteUnlockDate.value = ''
      writeNoteModal.style.display = 'flex'
      setTimeout(() => writeNoteModal.classList.add('show'), 10)
    })

    closeWriteNote.addEventListener('click', () => {
      writeNoteModal.classList.remove('show')
      setTimeout(() => writeNoteModal.style.display = 'none', 400)
    })

    btnSaveNote.addEventListener('click', () => {
      if (!noteTitleInput.value.trim() || !noteContentInput.value.trim()) {
        showToast(currentLang === 'en' ? 'Please fill all fields.' : 'Semua bidang harap diisi.')
        return
      }

      const forbiddenWords = ['jancok', 'bangsat', 'anjing', 'babi', 'kontol', 'memek', 'ngentot', 'perek', 'lonte', 'sialan', 'kampret', 'goblok', 'tolol', 'bego', 'idiot', 'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'whore', 'slut', 'bastard'];
      const textToFilter = (noteTitleInput.value + " " + noteContentInput.value).toLowerCase();

      const containsProfanity = forbiddenWords.some(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(textToFilter);
      });

      if (containsProfanity) {
        showToast(currentLang === 'en' ? 'Let us keep this space clean and sacred. Please refrain from using harsh words.' : 'Mari jaga ruang ini tetap suci. Mohon gunakan bahasa yang lebih damai.')
        return
      }

      let rawNotes = JSON.parse(localStorage.getItem('rof_my_notes') || '[]')
      // Custom ID sequence for notes starting at 10000 to not conflict with reflections
      let id = 10000 + rawNotes.length + 1
      rawNotes.push({
        id,
        title: noteTitleInput.value.trim(),
        content: noteContentInput.value.trim(),
        unlockDate: noteUnlockDate && noteUnlockDate.value ? noteUnlockDate.value : null,
        date: new Date().toISOString()
      })
      localStorage.setItem('rof_my_notes', JSON.stringify(rawNotes))

      writeNoteModal.classList.remove('show')
      setTimeout(() => writeNoteModal.style.display = 'none', 400)
      showToast(currentLang === 'en' ? 'Note saved locally.' : 'Catatan berhasil disimpan ke perangkat ini.')
      refreshCurrentView()
    })
  }

  const btnBackupNotes = document.getElementById('backupNotesBtn')
  if (btnBackupNotes) {
    btnBackupNotes.addEventListener('click', () => {
      let rawNotes = localStorage.getItem('rof_my_notes')
      if (!rawNotes || rawNotes === '[]') {
        showToast(currentLang === 'en' ? 'You have no echoes to backup yet.' : 'Belum ada isi jurnal untuk diunduh.')
        return
      }
      playAudioCue('swoosh')
      const blob = new Blob([rawNotes], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const dateStr = new Date().toISOString().split('T')[0]
      a.download = `ruang_rasa_jurnal_${dateStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast(currentLang === 'en' ? 'Echoes backed up successfully.' : 'Jurnal berhasil dicadangkan dan diunduh.')
    })
  }

  // 7. Floating Whispers
  const whispersEn = ["Let go...", "You are not alone", "Breathe...", "It's okay to rest", "This too shall pass", "Forgive yourself", "Don't rush", "You are enough"];
  const whispersId = ["Lepaskan...", "Kamu tidak sendirian", "Bernapaslah...", "Tidak apa-apa untuk istirahat", "Ini juga akan berlalu", "Maafkan dirimu", "Jangan terburu-buru", "Kau sudah cukup"];

  function spawnWhisper() {
    if (Math.random() > 0.5) return; // 50% chance 
    const isEn = currentLang === 'en';
    const arr = isEn ? whispersEn : whispersId;
    const text = arr[Math.floor(Math.random() * arr.length)];

    const w = document.createElement('div');
    w.className = 'floating-whisper';
    w.textContent = text;
    w.style.left = (Math.random() * 80 + 10) + 'vw';
    w.style.bottom = '-50px';
    document.body.appendChild(w);
    setTimeout(() => w.remove(), 16000);
  }
  setInterval(spawnWhisper, 8000);

  // 8. Message in a Bottle Logic
  const btnBottle = document.getElementById('btnBottle')
  const bottleModal = document.getElementById('bottleModal')
  const closeBottle = document.getElementById('closeBottle')
  const bottleInput = document.getElementById('bottleInput')
  const btnThrowBottle = document.getElementById('btnThrowBottle')
  const replyBottleBox = document.getElementById('replyBottleBox')
  const replyBottleText = document.getElementById('replyBottleText')

  const bottleRepliesEn = [
    "I hear you. Keep going.",
    "Your feelings are valid. Take your time.",
    "The tide will recede. Breathe.",
    "Someone out there understands you.",
    "Sending you a warm hug across the sea."
  ];
  const bottleRepliesId = [
    "Aku mendengarmu. Bertahanlah.",
    "Perasaanmu sangat valid. Tak perlu terburu-buru.",
    "Badai lautan ini pasti akan reda. Bernapaslah.",
    "Ada seseorang di luar sana yang memahamimu.",
    "Mengirimkan peluk sehangat mentari dari ujung lautan."
  ];

  if (btnBottle) {
    btnBottle.addEventListener('click', () => {
      bottleInput.value = ''
      bottleInput.style.display = 'block'
      btnThrowBottle.style.display = 'flex'
      replyBottleBox.style.display = 'none'
      bottleModal.style.display = 'flex'
      setTimeout(() => bottleModal.classList.add('show'), 10)
    })

    closeBottle.addEventListener('click', () => {
      bottleModal.classList.remove('show')
      setTimeout(() => bottleModal.style.display = 'none', 400)
    })

    btnThrowBottle.addEventListener('click', () => {
      if (!bottleInput.value.trim()) return;
      playAudioCue('paper')

      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-water-splash-1311.mp3')
      audio.volume = 0.5;
      audio.play().catch(e => console.log(e))

      bottleInput.style.display = 'none'
      btnThrowBottle.style.display = 'none'

      setTimeout(() => {
        playAudioCue('chime')
        const isEn = currentLang === 'en';
        const arr = isEn ? bottleRepliesEn : bottleRepliesId;
        const text = arr[Math.floor(Math.random() * arr.length)];

        replyBottleText.textContent = '"' + text + '"';
        replyBottleBox.style.display = 'block';
        showToast(currentLang === 'en' ? 'A reply washed ashore.' : 'Sebuah balasan terdampar di pantai.')
      }, 3000)
    })
  }

  // 9. Custom Cursor Logic (Lentera Ruh)
  const cursorDot = document.getElementById('customCursorDot')
  const cursorRing = document.getElementById('customCursorRing')

  if (cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    const smoothCursor = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(smoothCursor);
    };
    smoothCursor();

    // Hover effects via event delegation for all interactable elements
    document.addEventListener('mouseover', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
        e.target.closest('button') || e.target.closest('a') || e.target.closest('.poem-card') || e.target.closest('.close-btn') ||
        e.target.closest('.prose-content') || e.target.closest('.logo')) {
        cursorRing.classList.add('hovered')
      }
    }, true);

    document.addEventListener('mouseout', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' ||
        e.target.closest('button') || e.target.closest('a') || e.target.closest('.poem-card') || e.target.closest('.close-btn') ||
        e.target.closest('.prose-content') || e.target.closest('.logo')) {
        cursorRing.classList.remove('hovered')
      }
    }, true);
  }

  // 10. Water Ripple Click Effect
  document.addEventListener('click', (e) => {
    // Ignore clicks on buttons to avoid breaking their interaction flows visually
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('input') || e.target.closest('textarea')) return
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = (e.clientX - 15) + 'px';
    ripple.style.top = (e.clientY - 15) + 'px';
    ripple.style.width = '30px';
    ripple.style.height = '30px';
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);
  });

  // 11. Breathing Overlay Logic
  const btnBreatheMode = document.getElementById('btnBreatheMode')
  const breatheOverlay = document.getElementById('breatheOverlay')
  const closeBreatheBtn = document.getElementById('closeBreatheBtn')
  const breatheCircle = document.getElementById('breatheCircle')
  const breatheTextInner = document.getElementById('breatheTextInner')

  let breatheInterval;

  if (btnBreatheMode && breatheOverlay) {
    btnBreatheMode.addEventListener('click', () => {
      // Hide mood panel if open
      document.getElementById('moodWidgetPanel').classList.remove('open')

      breatheOverlay.style.display = 'flex'
      setTimeout(() => breatheOverlay.classList.add('show'), 10)

      const sequence = () => {
        breatheTextInner.textContent = currentLang === 'en' ? 'Inhale (4s)' : 'Tarik (4s)'
        breatheCircle.style.transform = 'scale(1.8)'
        playAudioCue('paper') // Subtle cue

        setTimeout(() => {
          breatheTextInner.textContent = currentLang === 'en' ? 'Hold (7s)' : 'Tahan (7s)'
          setTimeout(() => {
            breatheTextInner.textContent = currentLang === 'en' ? 'Exhale (8s)' : 'Hembuskan (8s)'
            breatheCircle.style.transform = 'scale(0.8)'
          }, 7000)
        }, 4000)
      }

      sequence()
      breatheInterval = setInterval(sequence, 19000); // 4 + 7 + 8 = 19
    })

    closeBreatheBtn.addEventListener('click', () => {
      clearInterval(breatheInterval)
      breatheOverlay.classList.remove('show')
      setTimeout(() => breatheOverlay.style.display = 'none', 500)
    })
  }

  // 12. Mood Yearbook
  const btnViewYearbook = document.getElementById('btnViewYearbook')
  const yearbookModal = document.getElementById('yearbookModal')
  const closeYearbook = document.getElementById('closeYearbook')
  const heatmapGrid = document.getElementById('heatmapGrid')

  if (btnViewYearbook && yearbookModal) {
    const renderYearbook = () => {
      let moodHistory = JSON.parse(localStorage.getItem('rof_mood_history') || '{}');
      heatmapGrid.innerHTML = '';

      // Generate past 28 days
      const today = new Date();
      for (let i = 27; i >= 0; i--) {
        let d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const mood = moodHistory[dStr];

        const cell = document.createElement('div');
        cell.className = 'yearbook-day';
        cell.title = dStr;

        if (mood) {
          cell.classList.add('has-mood');
          cell.textContent = dict.en.moods[mood] ? dict.en.moods[mood].charAt(0) : '✨'
          // Assign colors
          if (mood === 'sedih') cell.style.color = '#aaccff';
          if (mood === 'lelah') cell.style.color = '#cccccc';
          if (mood === 'overthinking') cell.style.color = '#ddaacc';
          if (mood === 'hancur') cell.style.color = '#e25555';
          if (mood === 'sepi') cell.style.color = '#bbaacc';
        } else {
          cell.textContent = d.getDate();
        }
        heatmapGrid.appendChild(cell);
      }
    }

    btnViewYearbook.addEventListener('click', () => {
      document.getElementById('moodWidgetPanel').classList.remove('open')
      renderYearbook()
      yearbookModal.style.display = 'flex'
      setTimeout(() => yearbookModal.classList.add('show'), 10)
    })

    closeYearbook.addEventListener('click', () => {
      yearbookModal.classList.remove('show')
      setTimeout(() => yearbookModal.style.display = 'none', 400)
    })
  }

  // 10. Pause audio when switching tabs
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (bgMusic && !bgMusic.paused) bgMusic.pause();
      if (rainAudio && !rainAudio.paused) rainAudio.pause();
    } else {
      if (isPlaying && bgMusic && bgMusic.paused) bgMusic.play().catch(() => { });
      if (isRainPlaying && rainAudio && rainAudio.paused) rainAudio.play().catch(() => { });
    }
  });

})

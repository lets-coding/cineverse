import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CineVerse database...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.adminActivityLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.watchlist.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.watchHistory.deleteMany();
  await prisma.downloadSource.deleteMany();
  await prisma.subtitleTrack.deleteMany();
  await prisma.videoSource.deleteMany();
  await prisma.movieCredit.deleteMany();
  await prisma.person.deleteMany();
  await prisma.movieLanguage.deleteMany();
  await prisma.movieIndustry.deleteMany();
  await prisma.movieCountry.deleteMany();
  await prisma.movieGenre.deleteMany();
  await prisma.language.deleteMany();
  await prisma.industry.deleteMany();
  await prisma.country.deleteMany();
  await prisma.genre.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const userPassword = await bcrypt.hash('UserPassword123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@cineverse.com',
      passwordHash: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@cineverse.com',
      passwordHash: userPassword,
      name: 'Cinema Fan',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  console.log('Users seeded: admin@cineverse.com, user@cineverse.com');

  // 3. Seed Genres
  const genreList = [
    { name: 'Action', slug: 'action' },
    { name: 'Adventure', slug: 'adventure' },
    { name: 'Animation', slug: 'animation' },
    { name: 'Comedy', slug: 'comedy' },
    { name: 'Crime', slug: 'crime' },
    { name: 'Documentary', slug: 'documentary' },
    { name: 'Drama', slug: 'drama' },
    { name: 'Family', slug: 'family' },
    { name: 'Fantasy', slug: 'fantasy' },
    { name: 'Horror', slug: 'horror' },
    { name: 'Mystery', slug: 'mystery' },
    { name: 'Romance', slug: 'romance' },
    { name: 'Sci-Fi', slug: 'sci-fi' },
    { name: 'Thriller', slug: 'thriller' },
  ];

  const genres: Record<string, string> = {};
  for (const g of genreList) {
    const created = await prisma.genre.create({ data: g });
    genres[g.name] = created.id;
  }

  // 4. Seed Countries
  const countryList = [
    { name: 'United States', code: 'US' },
    { name: 'India', code: 'IN' },
    { name: 'South Korea', code: 'KR' },
    { name: 'Japan', code: 'JP' },
    { name: 'United Kingdom', code: 'GB' },
    { name: 'France', code: 'FR' },
    { name: 'Spain', code: 'ES' },
    { name: 'China', code: 'CN' },
    { name: 'Hong Kong', code: 'HK' },
  ];

  const countries: Record<string, string> = {};
  for (const c of countryList) {
    const created = await prisma.country.create({ data: c });
    countries[c.name] = created.id;
  }

  // 5. Seed Industries
  const industryList = [
    { name: 'Hollywood', slug: 'hollywood' },
    { name: 'Bollywood', slug: 'bollywood' },
    { name: 'South Indian cinema', slug: 'south-indian' },
    { name: 'Tamil', slug: 'tamil' },
    { name: 'Telugu', slug: 'telugu' },
    { name: 'Malayalam', slug: 'malayalam' },
    { name: 'Kannada', slug: 'kannada' },
    { name: 'Korean', slug: 'korean' },
    { name: 'Japanese', slug: 'japanese' },
    { name: 'Chinese', slug: 'chinese' },
    { name: 'Hong Kong cinema', slug: 'hong-kong' },
    { name: 'British cinema', slug: 'british' },
    { name: 'French cinema', slug: 'french' },
    { name: 'Spanish cinema', slug: 'spanish' },
    { name: 'Other international cinema', slug: 'international' },
  ];

  const industries: Record<string, string> = {};
  for (const ind of industryList) {
    const created = await prisma.industry.create({ data: ind });
    industries[ind.name] = created.id;
  }

  // 6. Seed Languages
  const languageList = [
    { name: 'English', code: 'en' },
    { name: 'Hindi', code: 'hi' },
    { name: 'Tamil', code: 'ta' },
    { name: 'Telugu', code: 'te' },
    { name: 'Malayalam', code: 'ml' },
    { name: 'Kannada', code: 'kn' },
    { name: 'Korean', code: 'ko' },
    { name: 'Japanese', code: 'ja' },
    { name: 'French', code: 'fr' },
    { name: 'Spanish', code: 'es' },
  ];

  const languages: Record<string, string> = {};
  for (const l of languageList) {
    const created = await prisma.language.create({ data: l });
    languages[l.name] = created.id;
  }

  // 7. Seed Movies with real authorized media sources
  const moviesData = [
    {
      title: 'Tears of Steel',
      originalTitle: 'Tears of Steel',
      slug: 'tears-of-steel',
      description: 'Set in a dystopian future, a group of warriors and scientists gather at the Oude Kerk in Amsterdam to stage a desperate alternate history.',
      synopsis: 'Tears of Steel explores a future where Amsterdam has been taken over by rampaging robots. A team of scientists and old lovers attempt to reverse the calamitous course of humanity using experimental cybernetic memory reconstruction.',
      releaseYear: 2022,
      releaseDate: '2022-09-12',
      contentType: 'MOVIE',
      runtime: 12,
      ageRating: 'PG-13',
      externalRating: 8.4,
      ratingSource: 'IMDb',
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=R6MlUcmOul8',
      searchKeywords: 'sci-fi, cyborg, amsterdam, future, robots, blender open movie',
      isFeatured: true,
      isPublished: true,
      downloadEnabled: true,
      seoTitle: 'Watch Tears of Steel (2022) - HD Streaming & Download | CineVerse',
      seoDescription: 'Stream Tears of Steel in 4K/1080p HLS quality with multi-subtitles and fast authorized downloads on CineVerse.',
      genres: ['Sci-Fi', 'Action', 'Thriller'],
      countries: ['United States'],
      industries: ['Hollywood'],
      languages: [
        { name: 'English', isAudio: true, isSubtitle: true },
        { name: 'Spanish', isAudio: false, isSubtitle: true },
        { name: 'French', isAudio: false, isSubtitle: true },
      ],
      director: 'Ian Hubert',
      cast: [
        { name: 'Derek de Lint', characterName: 'Old Thom' },
        { name: 'Sergio Hasselbaink', characterName: 'Barley' },
        { name: 'Rogier Schippers', characterName: 'Young Thom' },
      ],
      videoSources: [
        {
          format: 'hls',
          streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          qualityLabel: 'Auto (HLS Multi-Bitrate)',
          isPrimary: true,
          duration: 734,
        },
        {
          format: 'mp4',
          streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          qualityLabel: '1080p MP4 Fallback',
          isPrimary: false,
          duration: 734,
        },
      ],
      subtitleTracks: [
        {
          language: 'en',
          label: 'English [CC]',
          vttUrl: 'https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.vtt',
          isDefault: true,
        },
      ],
      downloadSources: [
        {
          qualityLabel: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '1.4 GB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          accessType: 'PUBLIC',
        },
        {
          qualityLabel: '720p HD',
          resolution: '1280x720',
          fileSize: '780 MB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          accessType: 'PUBLIC',
        },
      ],
    },
    {
      title: 'Sintel',
      originalTitle: 'Sintel',
      slug: 'sintel',
      description: 'A lonely young woman searches the dangerous wilderness for a baby dragon that became her loyal friend and companion.',
      synopsis: 'Sintel follows a homeless wanderer who rescues and nurtures an injured juvenile dragon. When the beast is captured by an adult dragon, Sintel embarks on a perilous quest across snowy mountain peaks, ruined temples, and arid deserts to bring her companion home.',
      releaseYear: 2021,
      releaseDate: '2021-04-15',
      contentType: 'MOVIE',
      runtime: 15,
      ageRating: 'PG',
      externalRating: 8.8,
      ratingSource: 'IMDb',
      posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=eRsGyueVLvQ',
      searchKeywords: 'dragon, fantasy, adventure, quest, anime, animation',
      isFeatured: true,
      isPublished: true,
      downloadEnabled: true,
      seoTitle: 'Watch Sintel Fantasy Animation - CineVerse',
      seoDescription: 'Stream the award-winning animated fantasy epic Sintel in HD with adaptive streaming.',
      genres: ['Animation', 'Adventure', 'Fantasy'],
      countries: ['United States', 'France'],
      industries: ['Hollywood', 'French cinema'],
      languages: [
        { name: 'English', isAudio: true, isSubtitle: true },
        { name: 'French', isAudio: false, isSubtitle: true },
      ],
      director: 'Colin Levy',
      cast: [
        { name: 'Halina Reijn', characterName: 'Sintel' },
        { name: 'Thom Hoffman', characterName: 'Shaman' },
      ],
      videoSources: [
        {
          format: 'hls',
          streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
          qualityLabel: 'Auto (HLS Multi-Bitrate)',
          isPrimary: true,
          duration: 888,
        },
        {
          format: 'mp4',
          streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          qualityLabel: '1080p MP4 Fallback',
          isPrimary: false,
          duration: 888,
        },
      ],
      subtitleTracks: [
        {
          language: 'en',
          label: 'English',
          vttUrl: 'https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.vtt',
          isDefault: true,
        },
      ],
      downloadSources: [
        {
          qualityLabel: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '1.1 GB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          accessType: 'PUBLIC',
        },
      ],
    },
    {
      title: 'Big Buck Bunny',
      originalTitle: 'Big Buck Bunny',
      slug: 'big-buck-bunny',
      description: 'A large, gentle rabbit seeks whimsical revenge against three bullying forest critters who torment harmless butterflies and fruit.',
      synopsis: 'A large and lovable rabbit awakens on a glorious spring morning, admiring nature. However, a gang of three mischievous woodland animals - Frank the flying squirrel, Rinky the red squirrel, and Gimera the chinchilla - begin tormenting the peaceful forest. Bunny sets up hilarious traps to protect his friends.',
      releaseYear: 2020,
      releaseDate: '2020-04-10',
      contentType: 'SHORT_FILM',
      runtime: 10,
      ageRating: 'G',
      externalRating: 7.9,
      ratingSource: 'IMDb',
      posterUrl: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=YE7VzlLtp-4',
      searchKeywords: 'bunny, animal, comedy, family, kids, animation, forest',
      isFeatured: false,
      isPublished: true,
      downloadEnabled: true,
      seoTitle: 'Watch Big Buck Bunny - Family Animation on CineVerse',
      seoDescription: 'Stream Big Buck Bunny online in HD. Free, family-friendly animation.',
      genres: ['Animation', 'Comedy', 'Family'],
      countries: ['United States'],
      industries: ['Hollywood'],
      languages: [{ name: 'English', isAudio: true, isSubtitle: true }],
      director: 'Sacha Goedegebure',
      cast: [{ name: 'Bunny Ensemble', characterName: 'Various Forest Animals' }],
      videoSources: [
        {
          format: 'hls',
          streamUrl: 'https://test-streams.mux.dev/test_001/stream.m3u8',
          qualityLabel: 'Auto (HLS)',
          isPrimary: true,
          duration: 596,
        },
        {
          format: 'mp4',
          streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          qualityLabel: '1080p MP4',
          isPrimary: false,
          duration: 596,
        },
      ],
      subtitleTracks: [],
      downloadSources: [
        {
          qualityLabel: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '850 MB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          accessType: 'PUBLIC',
        },
      ],
    },
    {
      title: 'RRR: Rise Roar Revolt',
      originalTitle: 'Roudram Ranam Rudhiram',
      slug: 'rrr-rise-roar-revolt',
      description: 'A fearless revolutionary and an officer in the British force develop an unbreakable bond before their true identities emerge.',
      synopsis: 'In 1920s pre-independent India, Komaram Bheem travels to Delhi to rescue a young tribal girl kidnapped by British Governor Scott. Alluri Sitarama Raju, a decorated imperial police officer with a secret mission of his own, is assigned to capture him. When the two men cross paths in a daring river rescue, they forge an epic brotherhood.',
      releaseYear: 2023,
      releaseDate: '2023-03-24',
      contentType: 'MOVIE',
      runtime: 187,
      ageRating: 'PG-13',
      externalRating: 8.9,
      ratingSource: 'IMDb',
      posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=f_vbAtFSEc0',
      searchKeywords: 'tollywood, telugu, south indian, ss rajamouli, ram charan, jr ntr, action',
      isFeatured: true,
      isPublished: true,
      downloadEnabled: true,
      seoTitle: 'Watch RRR - South Indian Cinema Blockbuster on CineVerse',
      seoDescription: 'Stream and download RRR in Telugu, Hindi, Tamil, and Malayalam with high speed streaming.',
      genres: ['Action', 'Drama', 'Adventure'],
      countries: ['India'],
      industries: ['South Indian cinema', 'Telugu'],
      languages: [
        { name: 'Telugu', isAudio: true, isSubtitle: true },
        { name: 'Hindi', isAudio: true, isSubtitle: true },
        { name: 'Tamil', isAudio: true, isSubtitle: true },
        { name: 'English', isAudio: false, isSubtitle: true },
      ],
      director: 'S. S. Rajamouli',
      cast: [
        { name: 'N. T. Rama Rao Jr.', characterName: 'Komaram Bheem' },
        { name: 'Ram Charan', characterName: 'Alluri Sitarama Raju' },
        { name: 'Ajay Devgn', characterName: 'Venkata Rama Raju' },
        { name: 'Alia Bhatt', characterName: 'Sita' },
      ],
      videoSources: [
        {
          format: 'hls',
          streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          qualityLabel: 'Auto (HLS Multi-Bitrate)',
          isPrimary: true,
          duration: 11220,
        },
      ],
      subtitleTracks: [
        {
          language: 'en',
          label: 'English',
          vttUrl: 'https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.vtt',
          isDefault: true,
        },
      ],
      downloadSources: [
        {
          qualityLabel: '4K Ultra HD',
          resolution: '3840x2160',
          fileSize: '5.2 GB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          accessType: 'PUBLIC',
        },
        {
          qualityLabel: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '2.4 GB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          accessType: 'PUBLIC',
        },
      ],
    },
    {
      title: 'Parasite',
      originalTitle: 'Gisaengchung (기생충)',
      slug: 'parasite',
      description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
      synopsis: 'The Kim family are all unemployed living in a semi-basement apartment. When the son gets a recommendation to tutor the daughter of the affluent Park family, the Kims meticulously infiltrate the Park household one by one, culminating in an unexpected clash of socioeconomic realities.',
      releaseYear: 2023,
      releaseDate: '2023-05-30',
      contentType: 'MOVIE',
      runtime: 132,
      ageRating: 'R',
      externalRating: 8.6,
      ratingSource: 'IMDb',
      posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=5xH0hhJLEEQ',
      searchKeywords: 'korean, thriller, bong joon ho, academy award, drama, satire',
      isFeatured: true,
      isPublished: true,
      downloadEnabled: true,
      seoTitle: 'Watch Parasite (2023) - Korean Cinema on CineVerse',
      seoDescription: 'Stream Bong Joon-ho’s masterpiece Parasite in full HD with Korean audio and English subtitles.',
      genres: ['Thriller', 'Drama', 'Comedy'],
      countries: ['South Korea'],
      industries: ['Korean'],
      languages: [
        { name: 'Korean', isAudio: true, isSubtitle: true },
        { name: 'English', isAudio: false, isSubtitle: true },
      ],
      director: 'Bong Joon-ho',
      cast: [
        { name: 'Song Kang-ho', characterName: 'Kim Ki-taek' },
        { name: 'Lee Sun-kyun', characterName: 'Park Dong-ik' },
        { name: 'Cho Yeo-jeong', characterName: 'Choi Yeon-gyo' },
      ],
      videoSources: [
        {
          format: 'hls',
          streamUrl: 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8',
          qualityLabel: 'Auto HLS',
          isPrimary: true,
          duration: 7920,
        },
      ],
      subtitleTracks: [
        {
          language: 'en',
          label: 'English',
          vttUrl: 'https://raw.githubusercontent.com/andreyvit/subtitle-tools/master/sample.vtt',
          isDefault: true,
        },
      ],
      downloadSources: [
        {
          qualityLabel: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '2.1 GB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          accessType: 'PUBLIC',
        },
      ],
    },
    {
      title: 'Dangal',
      originalTitle: 'Dangal',
      slug: 'dangal',
      description: 'Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games.',
      synopsis: 'Based on the true story of Mahavir Singh Phogat, an amateur wrestler who trains his daughters Geeta and Babita to become India’s first world-class female wrestlers in a society steeped in patriarchal tradition.',
      releaseYear: 2022,
      releaseDate: '2022-12-23',
      contentType: 'MOVIE',
      runtime: 161,
      ageRating: 'PG',
      externalRating: 8.3,
      ratingSource: 'IMDb',
      posterUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=x_7YlGv9u1g',
      searchKeywords: 'bollywood, aamir khan, wrestling, sports, biopic, india, inspirational',
      isFeatured: false,
      isPublished: true,
      downloadEnabled: true,
      seoTitle: 'Watch Dangal - Bollywood Sports Biopic on CineVerse',
      seoDescription: 'Stream Dangal with Hindi audio and multi-language subtitles in HD.',
      genres: ['Action', 'Drama', 'Family'],
      countries: ['India'],
      industries: ['Bollywood'],
      languages: [
        { name: 'Hindi', isAudio: true, isSubtitle: true },
        { name: 'English', isAudio: false, isSubtitle: true },
      ],
      director: 'Nitesh Tiwari',
      cast: [
        { name: 'Aamir Khan', characterName: 'Mahavir Singh Phogat' },
        { name: 'Fatima Sana Shaikh', characterName: 'Geeta Phogat' },
        { name: 'Sanya Malhotra', characterName: 'Babita Kumari' },
      ],
      videoSources: [
        {
          format: 'mp4',
          streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          qualityLabel: '1080p MP4',
          isPrimary: true,
          duration: 9660,
        },
      ],
      subtitleTracks: [],
      downloadSources: [
        {
          qualityLabel: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '2.5 GB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          accessType: 'PUBLIC',
        },
      ],
    },
    {
      title: 'Money Heist (La Casa de Papel)',
      originalTitle: 'La Casa de Papel',
      slug: 'money-heist',
      description: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint.',
      synopsis: 'A criminal mastermind who goes by "The Professor" recruits eight thieves with code names named after cities. Together, they plan an audacious assault on the Royal Mint of Spain, locking themselves inside with hostages to print billions of untraceable banknotes.',
      releaseYear: 2023,
      releaseDate: '2023-01-10',
      contentType: 'SERIES',
      runtime: 50,
      ageRating: 'TV-MA',
      externalRating: 8.2,
      ratingSource: 'IMDb',
      posterUrl: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=_InqQJRqGW4',
      searchKeywords: 'spanish, heist, professor, tokyo, crime, series, thriller',
      isFeatured: false,
      isPublished: true,
      downloadEnabled: true,
      seoTitle: 'Watch Money Heist TV Series - CineVerse',
      seoDescription: 'Stream Money Heist Season 1-5 in Spanish and English with full HD playback.',
      genres: ['Action', 'Crime', 'Mystery', 'Thriller'],
      countries: ['Spain'],
      industries: ['Spanish cinema'],
      languages: [
        { name: 'Spanish', isAudio: true, isSubtitle: true },
        { name: 'English', isAudio: true, isSubtitle: true },
      ],
      director: 'Álex Pina',
      cast: [
        { name: 'Úrsula Corberó', characterName: 'Tokyo' },
        { name: 'Álvaro Morte', characterName: 'The Professor' },
        { name: 'Pedro Alonso', characterName: 'Berlin' },
      ],
      videoSources: [
        {
          format: 'hls',
          streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          qualityLabel: 'Auto HLS',
          isPrimary: true,
          duration: 3000,
        },
      ],
      subtitleTracks: [],
      downloadSources: [
        {
          qualityLabel: '1080p Full HD',
          resolution: '1920x1080',
          fileSize: '1.2 GB',
          format: 'mp4',
          downloadUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          accessType: 'PUBLIC',
        },
      ],
    },
    {
      title: 'Neon Odyssey',
      originalTitle: 'Neon Odyssey: Tokyo Drift',
      slug: 'neon-odyssey',
      description: 'A cyberpunk thriller following a rogue data courier navigating underground neon-lit Tokyo districts to deliver an encrypted consciousness.',
      synopsis: 'In a sprawling 2045 neo-Tokyo, memory runner Ren discovers that the neural drive in his possession contains the synthetic memory of a legendary AI architect targeted by megacorporations.',
      releaseYear: 2024,
      releaseDate: '2024-02-14',
      contentType: 'MOVIE',
      runtime: 118,
      ageRating: 'R',
      externalRating: 8.1,
      ratingSource: 'IMDb',
      posterUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&auto=format&fit=crop&q=80',
      backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=R6MlUcmOul8',
      searchKeywords: 'cyberpunk, tokyo, neon, anime, sci-fi, ai, future',
      isFeatured: false,
      isPublished: true,
      downloadEnabled: true,
      seoTitle: 'Watch Neon Odyssey (2024) - Cyberpunk Sci-Fi on CineVerse',
      seoDescription: 'Stream Neon Odyssey with Japanese audio and multi-lingual subtitles in 4K.',
      genres: ['Sci-Fi', 'Action', 'Thriller'],
      countries: ['Japan'],
      industries: ['Japanese'],
      languages: [
        { name: 'Japanese', isAudio: true, isSubtitle: true },
        { name: 'English', isAudio: false, isSubtitle: true },
      ],
      director: 'Kenji Sato',
      cast: [
        { name: 'Hiroshi Tanaka', characterName: 'Ren' },
        { name: 'Aoi Miyazaki', characterName: 'Maya' },
      ],
      videoSources: [
        {
          format: 'hls',
          streamUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
          qualityLabel: 'Auto HLS',
          isPrimary: true,
          duration: 7080,
        },
      ],
      subtitleTracks: [],
      downloadSources: [],
    },
  ];

  for (const m of moviesData) {
    const movie = await prisma.movie.create({
      data: {
        title: m.title,
        originalTitle: m.originalTitle,
        slug: m.slug,
        description: m.description,
        synopsis: m.synopsis,
        releaseYear: m.releaseYear,
        releaseDate: m.releaseDate,
        contentType: m.contentType,
        runtime: m.runtime,
        ageRating: m.ageRating,
        externalRating: m.externalRating,
        ratingSource: m.ratingSource,
        posterUrl: m.posterUrl,
        backdropUrl: m.backdropUrl,
        trailerUrl: m.trailerUrl,
        searchKeywords: m.searchKeywords,
        isFeatured: m.isFeatured,
        isPublished: m.isPublished,
        downloadEnabled: m.downloadEnabled,
        seoTitle: m.seoTitle,
        seoDescription: m.seoDescription,
      },
    });

    // Connect Genres
    for (const gName of m.genres) {
      if (genres[gName]) {
        await prisma.movieGenre.create({
          data: { movieId: movie.id, genreId: genres[gName] },
        });
      }
    }

    // Connect Countries
    for (const cName of m.countries) {
      if (countries[cName]) {
        await prisma.movieCountry.create({
          data: { movieId: movie.id, countryId: countries[cName] },
        });
      }
    }

    // Connect Industries
    for (const iName of m.industries) {
      if (industries[iName]) {
        await prisma.movieIndustry.create({
          data: { movieId: movie.id, industryId: industries[iName] },
        });
      }
    }

    // Connect Languages
    for (const l of m.languages) {
      if (languages[l.name]) {
        await prisma.movieLanguage.create({
          data: {
            movieId: movie.id,
            languageId: languages[l.name],
            isAudio: l.isAudio,
            isSubtitle: l.isSubtitle,
          },
        });
      }
    }

    // Connect Director & Cast
    if (m.director) {
      const directorPerson = await prisma.person.create({
        data: { name: m.director, role: 'DIRECTOR' },
      });
      await prisma.movieCredit.create({
        data: {
          movieId: movie.id,
          personId: directorPerson.id,
          role: 'DIRECTOR',
          order: 0,
        },
      });
    }

    for (let i = 0; i < m.cast.length; i++) {
      const actor = await prisma.person.create({
        data: { name: m.cast[i].name, role: 'ACTOR' },
      });
      await prisma.movieCredit.create({
        data: {
          movieId: movie.id,
          personId: actor.id,
          role: 'ACTOR',
          characterName: m.cast[i].characterName,
          order: i + 1,
        },
      });
    }

    // Video Sources
    for (const vs of m.videoSources) {
      await prisma.videoSource.create({
        data: {
          movieId: movie.id,
          format: vs.format,
          streamUrl: vs.streamUrl,
          qualityLabel: vs.qualityLabel,
          isPrimary: vs.isPrimary,
          duration: vs.duration,
        },
      });
    }

    // Subtitle Tracks
    for (const st of m.subtitleTracks) {
      await prisma.subtitleTrack.create({
        data: {
          movieId: movie.id,
          language: st.language,
          label: st.label,
          vttUrl: st.vttUrl,
          isDefault: st.isDefault,
        },
      });
    }

    // Download Sources
    for (const ds of m.downloadSources) {
      await prisma.downloadSource.create({
        data: {
          movieId: movie.id,
          qualityLabel: ds.qualityLabel,
          resolution: ds.resolution,
          fileSize: ds.fileSize,
          format: ds.format,
          downloadUrl: ds.downloadUrl,
          accessType: ds.accessType,
        },
      });
    }

    // Initial seed reviews
    await prisma.review.create({
      data: {
        userId: normalUser.id,
        movieId: movie.id,
        rating: 9,
        comment: `Outstanding cinematic experience! The streaming quality is seamless on CineVerse.`,
      },
    });
  }

  // Sample watch history for normalUser
  const firstMovie = await prisma.movie.findFirst({ where: { slug: 'tears-of-steel' } });
  if (firstMovie) {
    await prisma.watchHistory.create({
      data: {
        userId: normalUser.id,
        movieId: firstMovie.id,
        progressSeconds: 180,
        durationSeconds: 734,
        completed: false,
      },
    });

    await prisma.watchlist.create({
      data: {
        userId: normalUser.id,
        movieId: firstMovie.id,
      },
    });

    await prisma.favorite.create({
      data: {
        userId: normalUser.id,
        movieId: firstMovie.id,
      },
    });
  }

  // Admin Activity Log
  await prisma.adminActivityLog.create({
    data: {
      adminId: adminUser.id,
      action: 'SYSTEM_INITIALIZATION',
      entityType: 'System',
      details: 'CineVerse database seeded with categories, cinema industries, movies, and streams.',
    },
  });

  console.log('Database seeded successfully with all movies, categories, and test accounts!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

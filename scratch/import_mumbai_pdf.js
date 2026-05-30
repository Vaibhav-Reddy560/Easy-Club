const fs = require('fs');

const mumbaiData = [
  // 1. Biological Sciences and Biotechnology - Collegiate
  {
    "id": "mum-001",
    "name": "BioX Club",
    "organization": "IIT Bombay",
    "category": "Biological Sciences and Biotechnology",
    "description": "Blends biology with technology; focuses on synthetic biology, bioinformatics, and low-cost diagnostics. Developed open-source hardware for biological experiments.",
    "location": "Mumbai",
    "links": { "website": "https://tech-iitb.org/clubs/" }
  },
  {
    "id": "mum-002",
    "name": "Bio-Engineering Association",
    "organization": "IITB",
    "category": "Biological Sciences and Biotechnology",
    "description": "Department-specific body promoting advanced research in cellular and tissue engineering. Organized international seminars on neural engineering.",
    "location": "Mumbai",
    "links": { "website": "https://bio.iitb.ac.in" }
  },
  {
    "id": "mum-003",
    "name": "Microzone Association",
    "organization": "MCC",
    "category": "Biological Sciences and Biotechnology",
    "description": "Focuses on microbiology and genetic research through student-led symposiums. Conducted 'Microcampus Odyssey'.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  {
    "id": "mum-004",
    "name": "Department of Biotechnology",
    "organization": "ICT",
    "category": "Biological Sciences and Biotechnology",
    "description": "Technical student body overseeing specialized research in fermentation and polymer science.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  {
    "id": "mum-005",
    "name": "Home Science Association",
    "organization": "MCC",
    "category": "Biological Sciences and Biotechnology",
    "description": "Interdisciplinary body focusing on nutrition, bio-science, and family resource management.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  // 1. Biological Sciences and Biotechnology - Non-Collegiate
  {
    "id": "mum-006",
    "name": "Indian Society of Chemists and Biologists (ISCB)",
    "organization": "Independent",
    "category": "Biological Sciences and Biotechnology",
    "description": "Promotes interdisciplinary cooperation in medicinal and biomolecular chemistry. Signed MoU with EFMC.",
    "location": "Mumbai",
    "links": { "website": "https://iscbindia.com" }
  },
  {
    "id": "mum-007",
    "name": "Society for Materials Chemistry (Bio-Materials)",
    "organization": "Independent",
    "category": "Biological Sciences and Biotechnology",
    "description": "Focuses on biocompatible materials for medical implants and drug delivery. Conducts national workshops on SPC-MAT.",
    "location": "Mumbai",
    "links": { "website": "https://smcindia.org" }
  },
  {
    "id": "mum-008",
    "name": "Nehru Planetarium (Science Wing)",
    "organization": "Independent",
    "category": "Biological Sciences and Biotechnology",
    "description": "Hosts regular biological science lectures on astrobiology and the origin of life. Conducts 'Science Day' exhibitions.",
    "location": "Mumbai",
    "links": { "website": "https://nehru-centre.org" }
  },

  // 2. Mathematics and Quantitative Analysis - Collegiate
  {
    "id": "mum-009",
    "name": "Quant Club",
    "organization": "IIT Bombay",
    "category": "Mathematics and Quantitative Analysis",
    "description": "Focuses on quantitative finance, probability, and algorithmic trading strategies. Conducts workshops on derivatives pricing.",
    "location": "Mumbai",
    "links": { "website": "https://tech-iitb.org/clubs/" }
  },
  {
    "id": "mum-010",
    "name": "Maths and Physics Club (MnP)",
    "organization": "IITB",
    "category": "Mathematics and Quantitative Analysis",
    "description": "Celebrates basic sciences through symposiums, lectures, and research funding.",
    "location": "Mumbai",
    "links": { "website": "https://mnp-club.github.io" }
  },
  {
    "id": "mum-011",
    "name": "Mathletics",
    "organization": "MCC",
    "category": "Mathematics and Quantitative Analysis",
    "description": "Encourages interest in mathematics through puzzles, logic competitions, and 'Hypatia' (Math Day).",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  {
    "id": "mum-012",
    "name": "Artha",
    "organization": "Department of Economics",
    "category": "Mathematics and Quantitative Analysis",
    "description": "Focuses heavily on quantitative analysis and statistical modeling for B.Sc. students.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  {
    "id": "mum-013",
    "name": "Academic Discussion Forum",
    "organization": "IITB",
    "category": "Mathematics and Quantitative Analysis",
    "description": "A peer-led forum for discussing complex mathematical theorems and problem-solving.",
    "location": "Mumbai",
    "links": { "website": "https://iitb.ac.in" }
  },
  // 2. Mathematics and Quantitative Analysis - Non-Collegiate
  {
    "id": "mum-014",
    "name": "The Mathematics Consortium (TMC)",
    "organization": "Independent",
    "category": "Mathematics and Quantitative Analysis",
    "description": "A consortium of mathematical societies in India and SAARC for research collaboration.",
    "location": "Mumbai",
    "links": { "website": "https://themathconsortium.in" }
  },
  {
    "id": "mum-015",
    "name": "Indian Mathematical Society (IMS)",
    "organization": "Independent",
    "category": "Mathematics and Quantitative Analysis",
    "description": "The oldest scientific society in India for promoting mathematical study. Publishes 'The Mathematics Student'.",
    "location": "Mumbai",
    "links": { "website": "https://indianmathsoc.org" }
  },
  {
    "id": "mum-016",
    "name": "Ramanujan Mathematical Society (RMS)",
    "organization": "Independent",
    "category": "Mathematics and Quantitative Analysis",
    "description": "Promotes mathematical education and the legacy of Srinivasa Ramanujan. Conducts training for Ph.D. scholars.",
    "location": "Mumbai",
    "links": { "website": "https://ramanujanmathsociety.org" }
  },
  {
    "id": "mum-017",
    "name": "Indian Statistical Association (ISA)",
    "organization": "Independent",
    "category": "Mathematics and Quantitative Analysis",
    "description": "Professional body for statisticians focusing on probability and research methodology.",
    "location": "Mumbai",
    "links": { "website": "https://isa.org.in" }
  },

  // 3. Physics and Theoretical Research - Collegiate
  {
    "id": "mum-018",
    "name": "Maths and Physics Club",
    "organization": "IITB",
    "category": "Physics and Theoretical Research",
    "description": "Aim to reignite inquisitiveness for basic sciences through lectures and lab visits. Organized visits to campus labs.",
    "location": "Mumbai",
    "links": { "website": "https://mnp-club.github.io" }
  },
  {
    "id": "mum-019",
    "name": "Physics Association",
    "organization": "MCC",
    "category": "Physics and Theoretical Research",
    "description": "Organizes 'fun activities with physics' to encourage undergraduate interest. Conducts 'Electro-Hunt'.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  {
    "id": "mum-020",
    "name": "Engineering Physics Society",
    "organization": "IITB",
    "category": "Physics and Theoretical Research",
    "description": "Departmental body focusing on the application of physics in modern engineering (photonics, semiconductors).",
    "location": "Mumbai",
    "links": { "website": "https://iitb.ac.in" }
  },
  {
    "id": "mum-021",
    "name": "AR VR Club",
    "organization": "VJTI",
    "category": "Physics and Theoretical Research",
    "description": "Explores the physics of light, optics, and perception through augmented and virtual reality.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-022",
    "name": "Academic Mentorship Club",
    "organization": "VJTI",
    "category": "Physics and Theoretical Research",
    "description": "Provides academic support for students in difficult physics and engineering courses.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  // 3. Physics and Theoretical Research - Non-Collegiate
  {
    "id": "mum-023",
    "name": "Society for Materials Chemistry (SMC)",
    "organization": "Independent",
    "category": "Physics and Theoretical Research",
    "description": "Professional body promoting research in materials chemistry and physics. Hosted the 7th National Workshop.",
    "location": "Mumbai",
    "links": { "website": "https://smcindia.org" }
  },
  {
    "id": "mum-024",
    "name": "Indian Academy of Mathematics",
    "organization": "Independent",
    "category": "Physics and Theoretical Research",
    "description": "Promotes theoretical research at the intersection of math and theoretical physics.",
    "location": "Mumbai",
    "links": { "website": "https://iam.org.in" }
  },
  {
    "id": "mum-025",
    "name": "Nehru Centre (Science Wing)",
    "organization": "Independent",
    "category": "Physics and Theoretical Research",
    "description": "Acts as the primary public outreach center for theoretical physics in Mumbai. Conducts lectures by renowned scientists.",
    "location": "Mumbai",
    "links": { "website": "https://nehru-centre.org" }
  },

  // 4. Chemical Technology and Chemistry - Collegiate
  {
    "id": "mum-026",
    "name": "Chemistry Club",
    "organization": "IIT Bombay",
    "category": "Chemical Technology and Chemistry",
    "description": "Unites students with a love for chemistry through experimental and academic exploration.",
    "location": "Mumbai",
    "links": { "website": "https://tech-iitb.org/clubs/" }
  },
  {
    "id": "mum-027",
    "name": "Technological Association",
    "organization": "ICT Mumbai",
    "category": "Chemical Technology and Chemistry",
    "description": "The overarching student body overseeing 29 representatives for technical and cultural fests. Organizes 'Vortex'.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  {
    "id": "mum-028",
    "name": "Chemical Engineering Association (ChEA)",
    "organization": "IITB",
    "category": "Chemical Technology and Chemistry",
    "description": "Department specific body promoting process engineering and industrial chemistry. Conducts 'AZeotropy'.",
    "location": "Mumbai",
    "links": { "website": "https://che.iitb.ac.in" }
  },
  {
    "id": "mum-029",
    "name": "Chemistry Association",
    "organization": "MCC",
    "category": "Chemical Technology and Chemistry",
    "description": "Organizes 'Culinary Chemix' and 'Academicia' to promote chemistry through flavor and food.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  {
    "id": "mum-030",
    "name": "Bombay Technologists",
    "organization": "ICT",
    "category": "Chemical Technology and Chemistry",
    "description": "Runs the in-house technical journal focusing on scientific writing and chemical research.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  // 4. Chemical Technology and Chemistry - Non-Collegiate
  {
    "id": "mum-031",
    "name": "Society for Materials Chemistry (SMC)",
    "organization": "Independent",
    "category": "Chemical Technology and Chemistry",
    "description": "Professional body promoting materials chemistry among scientists and engineers. Organizes biennial symposia (ISMC).",
    "location": "Mumbai",
    "links": { "website": "https://smcindia.org" }
  },
  {
    "id": "mum-032",
    "name": "Indian Society of Chemists and Biologists (ISCB)",
    "organization": "Independent",
    "category": "Chemical Technology and Chemistry",
    "description": "Focuses on interdisciplinary coop and promoting awareness of recent developments in science.",
    "location": "Mumbai",
    "links": { "website": "https://iscbindia.com" }
  },
  {
    "id": "mum-033",
    "name": "Udct Alumni Association",
    "organization": "Independent",
    "category": "Chemical Technology and Chemistry",
    "description": "Networking platform for former chemical technology students of ICT Mumbai.",
    "location": "Mumbai",
    "links": { "website": "https://udctalumni.org.in" }
  },

  // 5. Racing and Automotive Engineering - Collegiate
  {
    "id": "mum-034",
    "name": "IIT Bombay Racing",
    "organization": "IIT Bombay",
    "category": "Racing and Automotive Engineering",
    "description": "Student-led team designing and fabricating high-performance formula electric race cars. Innovators in EV powertrains.",
    "location": "Mumbai",
    "links": { "website": "https://iitbracing.org" }
  },
  {
    "id": "mum-035",
    "name": "VJTI Racing",
    "organization": "VJTI",
    "category": "Racing and Automotive Engineering",
    "description": "Focuses on All-Terrain Vehicles (ATVs) and engines for BAJA SAE India competitions.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-036",
    "name": "SAE Racing Club",
    "organization": "VJTI",
    "category": "Racing and Automotive Engineering",
    "description": "Collegiate chapter of the Society of Automotive Engineers promoting racing excellence.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-037",
    "name": "Hyperloop IITB",
    "organization": "IITB",
    "category": "Racing and Automotive Engineering",
    "description": "Redefining speed by developing high-speed pod transportation systems. Represented India at SpaceX Hyperloop competitions.",
    "location": "Mumbai",
    "links": { "website": "https://hyperloopiitb.com" }
  },
  {
    "id": "mum-038",
    "name": "Team Shunya",
    "organization": "IITB",
    "category": "Racing and Automotive Engineering",
    "description": "Focuses on net-zero energy building, utilizes automotive thermal management principles.",
    "location": "Mumbai",
    "links": { "website": "https://teamshunya.in" }
  },
  // 5. Racing and Automotive Engineering - Non-Collegiate
  {
    "id": "mum-039",
    "name": "Royal Western India Turf Club",
    "organization": "Independent",
    "category": "Racing and Automotive Engineering",
    "description": "Historical hub for the city’s elite sporting culture. Hosts the Indian Derby in Mahalaxmi.",
    "location": "Mahalaxmi, Mumbai",
    "links": { "website": "https://rwitc.com" }
  },
  {
    "id": "mum-040",
    "name": "Enfield Riders Club",
    "organization": "Independent",
    "category": "Racing and Automotive Engineering",
    "description": "A community for Royal Enfield enthusiasts focusing on long-distance touring and mechanical DIY.",
    "location": "Mumbai",
    "links": { "website": "https://enfieldriders.com" }
  },
  {
    "id": "mum-041",
    "name": "Palm Beach Riders",
    "organization": "Independent",
    "category": "Racing and Automotive Engineering",
    "description": "Navi Mumbai-based motorcycling group focused on safety and community riding events.",
    "location": "Navi Mumbai",
    "links": { "website": "https://www.facebook.com/PalmBeachRiders" }
  },

  // 6. Dance and Choreography - Collegiate
  {
    "id": "mum-042",
    "name": "Montage (NMIMS ASMSOC)",
    "organization": "NMIMS",
    "category": "Dance and Choreography",
    "description": "The official cultural club; focuses on interconnecting dance, drama, and fashion.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-043",
    "name": "Culturals @IITB",
    "organization": "IITB",
    "category": "Dance and Choreography",
    "description": "Umbrella body for performing arts; hosts diverse genres including Classical and Folk.",
    "location": "Mumbai",
    "links": { "website": "https://iitb-culturals.org" }
  },
  {
    "id": "mum-044",
    "name": "Pratibimb Dance Wing",
    "organization": "VJTI",
    "category": "Dance and Choreography",
    "description": "VJTI's national cultural festival wing that showcases versatility in street and classical dance.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-045",
    "name": "Ami-Cult",
    "organization": "Amity Mumbai",
    "category": "Dance and Choreography",
    "description": "Performing arts club focusing on professional and leadership skills through dance.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu/mumbai" }
  },
  {
    "id": "mum-046",
    "name": "Performing Arts Club",
    "organization": "VJTI",
    "category": "Dance and Choreography",
    "description": "Focuses on the academic and artistic integration of performing arts into student life.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  // 6. Dance and Choreography - Non-Collegiate
  {
    "id": "mum-047",
    "name": "NCPA (National Centre for the Performing Arts)",
    "organization": "Independent",
    "category": "Dance and Choreography",
    "description": "India's premier cultural institution for preserving and promoting classical dance. Hosts 700+ events annually.",
    "location": "Mumbai",
    "links": { "website": "https://ncpamumbai.com" }
  },
  {
    "id": "mum-048",
    "name": "AcroYoga Mumbai (Jenny Hoessler)",
    "organization": "Independent",
    "category": "Dance and Choreography",
    "description": "Focuses on the solar and lunar parts of acrobatics—basing, flying, and core training.",
    "location": "Mumbai",
    "links": { "website": "https://smcindia.org" } // Using as placeholder if specific not found
  },
  {
    "id": "mum-049",
    "name": "Zumba Workshop (VIT Hobby Club)",
    "organization": "VIT",
    "category": "Dance and Choreography",
    "description": "Provides high-energy fitness and dance training for local residents and students.",
    "location": "Mumbai",
    "links": { "website": "https://vit.edu.in" }
  },
  {
    "id": "mum-050",
    "name": "Country Club (Wellness Wing)",
    "organization": "Independent",
    "category": "Dance and Choreography",
    "description": "Offers daily dance and fitness classes including Bollywood and Aerobics. Popular among South Mumbai residents.",
    "location": "Mumbai",
    "links": { "website": "https://countryclubindia.net" }
  },

  // 7. Singing and Musical Performance - Collegiate
  {
    "id": "mum-051",
    "name": "Indian Music Group (IMG)",
    "organization": "St. Xavier's",
    "category": "Singing and Musical Performance",
    "description": "Promotes Indian Classical Music through concerts and appreciation courses. Organizes 'Jan-Fest'.",
    "location": "Mumbai",
    "links": { "website": "https://xaviers.edu" }
  },
  {
    "id": "mum-052",
    "name": "Treblemakers",
    "organization": "NMIMS SBM",
    "category": "Singing and Musical Performance",
    "description": "Interest-based music cell for management students; focuses on contemporary genres.",
    "location": "Mumbai",
    "links": { "website": "https://sbm.nmims.edu" }
  },
  {
    "id": "mum-053",
    "name": "Music Club of ICT",
    "organization": "ICT",
    "category": "Singing and Musical Performance",
    "description": "Focuses on vocal and instrumental music development for chemical tech students. Core performer for 'ManZar'.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  {
    "id": "mum-054",
    "name": "Music Association",
    "organization": "MCC",
    "category": "Singing and Musical Performance",
    "description": "Organizes 'Open Mic' events and 'Nostalgia Knockout' to foster musical bonding.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  {
    "id": "mum-055",
    "name": "Roots (IIT Bombay Music Club)",
    "organization": "IIT Bombay",
    "category": "Singing and Musical Performance",
    "description": "Dedicated to Indian classical and folk music within the IITB cultural ecosystem.",
    "location": "Mumbai",
    "links": { "website": "https://iitb-culturals.org" }
  },
  // 7. Singing and Musical Performance - Non-Collegiate
  {
    "id": "mum-056",
    "name": "Sofar Sounds Mumbai",
    "organization": "Independent",
    "category": "Singing and Musical Performance",
    "description": "Community of music-lovers hosting secret gigs in unique city locations. Listening is prioritized.",
    "location": "Mumbai",
    "links": { "website": "https://sofarsounds.com" }
  },
  {
    "id": "mum-057",
    "name": "Music Jammin",
    "organization": "Independent",
    "category": "Singing and Musical Performance",
    "description": "Platform for budding artists and local talent to showcase and collaborate. Meets twice a month.",
    "location": "Mumbai",
    "links": { "website": "https://musicjammin.in" }
  },
  {
    "id": "mum-058",
    "name": "My Music Gym",
    "organization": "Independent",
    "category": "Singing and Musical Performance",
    "description": "A head-office hub for vocational music training and community jamming. Rated for collaborative atmosphere.",
    "location": "Mumbai",
    "links": { "website": "https://mymusicgym.com" }
  },
  {
    "id": "mum-059",
    "name": "The Bandra Base",
    "organization": "Independent",
    "category": "Singing and Musical Performance",
    "description": "A community space and cultural club dedicated to intimate musical performances. Boutique venue for jazz/indie.",
    "location": "West Mumbai",
    "links": { "website": "https://thebandrabase.in" }
  },

  // 8. Theatre, Acting, and Dramatics - Collegiate
  {
    "id": "mum-060",
    "name": "Fourthwall",
    "organization": "IIT Bombay",
    "category": "Theatre, Acting, and Dramatics",
    "description": "The official dramatics club focusing on street plays and stage performances. Consistently wins national competitions.",
    "location": "Mumbai",
    "links": { "website": "https://fourthwall.iitb.ac.in" }
  },
  {
    "id": "mum-061",
    "name": "Rangawardhan",
    "organization": "VJTI",
    "category": "Theatre, Acting, and Dramatics",
    "description": "Dedicated to Marathi culture through drama, adaptations, and literature. Celebrated its 25th anniversary in 2024.",
    "location": "Mumbai",
    "links": { "website": "https://rangawardhan.com" }
  },
  {
    "id": "mum-062",
    "name": "Ami Theatre",
    "organization": "Amity Mumbai",
    "category": "Theatre, Acting, and Dramatics",
    "description": "Theatre club focusing on professional skills and harnessing student potential. Organizes meaningful cultural activities.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu.in" }
  },
  {
    "id": "mum-063",
    "name": "Nepathya",
    "organization": "NMIMS SBM",
    "category": "Theatre, Acting, and Dramatics",
    "description": "Interest-based cell for stage performances and theatrical management. Managed major productions for 'RangPunch'.",
    "location": "Mumbai",
    "links": { "website": "https://sbm.nmims.edu" }
  },
  {
    "id": "mum-064",
    "name": "Montage Drama Wing",
    "organization": "NMIMS",
    "category": "Theatre, Acting, and Dramatics",
    "description": "Focuses on interconnecting art forms through stagecraft and performance. Hosted 'Euphoria'.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  // 8. Theatre, Acting, and Dramatics - Non-Collegiate
  {
    "id": "mum-065",
    "name": "Naatakwaale Theatre Company",
    "organization": "Independent",
    "category": "Theatre, Acting, and Dramatics",
    "description": "Professional group performing stage, street, and corporate plays. Performed 1200+ street plays.",
    "location": "Mumbai",
    "links": { "website": "https://naatakwaale.in" }
  },
  {
    "id": "mum-066",
    "name": "Prithvi Theatre (Caferati)",
    "organization": "Independent",
    "category": "Theatre, Acting, and Dramatics",
    "description": "Hosting open-mic sessions for written and performed theatrical work. Features budding dramatic talent.",
    "location": "Mumbai",
    "links": { "website": "https://prithvitheatre.org" }
  },
  {
    "id": "mum-067",
    "name": "Manch & More",
    "organization": "Independent",
    "category": "Theatre, Acting, and Dramatics",
    "description": "Cultural and theatrical club focusing on regional and modern drama in Malad. Community-based.",
    "location": "Malad, Mumbai",
    "links": { "website": "https://manchandmore.in" }
  },
  {
    "id": "mum-068",
    "name": "New Acropolis (Philosophical Theatre)",
    "organization": "Independent",
    "category": "Theatre, Acting, and Dramatics",
    "description": "Uses theatre to explore philosophical themes like the 'Way of the Samurai'. Global Network.",
    "location": "Mumbai",
    "links": { "website": "https://acropolis.org.in" }
  },

  // 9. Astronomy, Space Science, and Rocketry - Collegiate
  {
    "id": "mum-069",
    "name": "Krittika",
    "organization": "IIT Bombay",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "The official astronomy club; aims to reignite curiosity for the cosmos. Conducts stargazing sessions.",
    "location": "Mumbai",
    "links": { "website": "https://tech-iitb.org/clubs/" }
  },
  {
    "id": "mum-070",
    "name": "Vishwa",
    "organization": "VJTI",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "Space science club aiming to launch VJTI’s first student satellite. Participates in IRC, URC, and CanSat.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-071",
    "name": "Ami-Astro",
    "organization": "Amity Mumbai",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "Focuses on the study of space sciences and observational astronomy. Organizes campus-wide events.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu.in" }
  },
  {
    "id": "mum-072",
    "name": "Aero VJTI",
    "organization": "VJTI",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "Specialized wing focusing on aerospace engineering and high-altitude ballooning. Managed by faculty.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-073",
    "name": "Pratham Team",
    "organization": "IITB",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "Focused exclusively on satellite design and launch logistics for student satellite missions.",
    "location": "Mumbai",
    "links": { "website": "https://iitb.ac.in" }
  },
  // 9. Astronomy, Space Science, and Rocketry - Non-Collegiate
  {
    "id": "mum-074",
    "name": "Khagol Mandal",
    "organization": "Independent",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "Registered voluntary organization focusing on public sky sessions. Hosted 1st International Pro-Am Meeting.",
    "location": "Mumbai",
    "links": { "website": "https://khagolmandal.com" }
  },
  {
    "id": "mum-075",
    "name": "Akashmitra Mandal (Kalyan)",
    "organization": "Independent",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "Amateur astronomers organization focusing on systematic study and research. Discovered first SOHO comet in India.",
    "location": "Kalyan, Mumbai",
    "links": { "website": "https://akashmitra.org" }
  },
  {
    "id": "mum-076",
    "name": "i-RoboChakra (Space Wing)",
    "organization": "Independent",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "ISRO Registered Official Space Tutor Program for young innovators. Journey through space technology.",
    "location": "Navi Mumbai",
    "links": { "website": "https://navimumbai.irobochakra.com" }
  },
  {
    "id": "mum-077",
    "name": "The Himalayan Club (Library)",
    "organization": "Independent",
    "category": "Astronomy, Space Science, and Rocketry",
    "description": "While mountaineering-focused, maintains a world-class library of maps and stars. Provides resources for high-altitude research.",
    "location": "Mumbai",
    "links": { "website": "https://himalayanclub.org" }
  },

  // 10. Coding, Web Development, and Cybersecurity - Collegiate
  {
    "id": "mum-078",
    "name": "Web and Coding Club (WnCC)",
    "organization": "IITB",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "The official programming club promoting everything from web-dev to competitive coding. Runs 'Seasons of Code'.",
    "location": "Mumbai",
    "links": { "website": "https://tech-iitb.org/clubs/" }
  },
  {
    "id": "mum-079",
    "name": "Community of Coders (CoC)",
    "organization": "VJTI",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "Focuses on data structures, algorithms, and collaborative development. Consistent top finishers in national hackathons.",
    "location": "Mumbai",
    "links": { "website": "https://cocvjti.org" }
  },
  {
    "id": "mum-080",
    "name": "DevCom",
    "organization": "IIT Bombay",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "Dedicated development community within IITB focusing on institutional portals and certificate portals.",
    "location": "Mumbai",
    "links": { "website": "https://iitb.ac.in" }
  },
  {
    "id": "mum-081",
    "name": "GDSC VJTI",
    "organization": "VJTI",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "Google Developer Student Club focusing on Google cloud and mobile tech. Organized workshops on Flutter and AI.",
    "location": "Mumbai",
    "links": { "website": "https://gdsc.community.dev" }
  },
  {
    "id": "mum-082",
    "name": "Cybersecurity Community",
    "organization": "IITB",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "Focused on network security, ethical hacking, and data protection. Conducts 'Capture the Flag' events.",
    "location": "Mumbai",
    "links": { "website": "https://iitb.ac.in" }
  },
  // 10. Coding, Web Development, and Cybersecurity - Non-Collegiate
  {
    "id": "mum-083",
    "name": "Mumbai Coding Club",
    "organization": "Independent",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "Professional training hub focusing on full-stack development and Python. Reports 100% Avg Salary Hike.",
    "location": "Mumbai",
    "links": { "website": "https://mumbaicodingclub.com" }
  },
  {
    "id": "mum-084",
    "name": "SP Robotics Maker Lab",
    "organization": "Independent",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "National chain focusing on coding, drones, and IOT for young creators. India’s No. 1 Coding & Robotics Learning Centre.",
    "location": "Mumbai",
    "links": { "website": "https://sproboticworks.com" }
  },
  {
    "id": "mum-085",
    "name": "La Electronics Lab (Coding Wing)",
    "organization": "Independent",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "Master Arduino, ESP32, and Raspberry Pi through structured courses. Provided assistance for final-year projects.",
    "location": "Mumbai",
    "links": { "website": "https://laelectronicslab.in" }
  },
  {
    "id": "mum-086",
    "name": "i-RoboChakra (Coding Track)",
    "organization": "Independent",
    "category": "Coding, Web Development, and Cybersecurity",
    "description": "Teaches machine learning and AI concepts to young innovators in Navi Mumbai. Prepares children for careers in tech.",
    "location": "Navi Mumbai",
    "links": { "website": "https://navimumbai.irobochakra.com" }
  },

  // 11. Mountaineering, Trekking, and Adventure Sports - Collegiate
  {
    "id": "mum-087",
    "name": "Adventure Sports",
    "organization": "IIT Bombay",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "Focuses on trekking, rock climbing, paragliding, and mountaineering courses. Organized expeditions in Sahyadri.",
    "location": "Mumbai",
    "links": { "website": "https://gymkhana.iitb.ac.in" }
  },
  {
    "id": "mum-088",
    "name": "Hobby Club",
    "organization": "VIT Mumbai",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "Promotes networking and personality development through trekking and stargazing.",
    "location": "Mumbai",
    "links": { "website": "https://vit.edu.in" }
  },
  {
    "id": "mum-089",
    "name": "Cycling Club",
    "organization": "IIT Bombay",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "Promotes sustainable travel and high-intensity fitness through long-distance rides. Conducts inter-city tours.",
    "location": "Mumbai",
    "links": { "website": "https://gymkhana.iitb.ac.in" }
  },
  {
    "id": "mum-090",
    "name": "Skating Club",
    "organization": "IIT Bombay",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "Focuses on rhythmic movement and high-speed balance through skating events. Managed by Adventure council.",
    "location": "Mumbai",
    "links": { "website": "https://gymkhana.iitb.ac.in" }
  },
  // 11. Mountaineering, Trekking, and Adventure Sports - Non-Collegiate
  {
    "id": "mum-091",
    "name": "Girivihar",
    "organization": "Independent",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "Founded in 1954; premier mountaineering club in India focusing on high altitudes. Organized 50+ Himalayan expeditions.",
    "location": "Mumbai",
    "links": { "website": "https://girivihar.org" }
  },
  {
    "id": "mum-092",
    "name": "The Himalayan Club",
    "organization": "Independent",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "Established in 1928; one of the oldest clubs for travel and exploration in the Himalayas. Publishes 'Himalayan Journal'.",
    "location": "Mumbai",
    "links": { "website": "https://himalayanclub.org" }
  },
  {
    "id": "mum-093",
    "name": "Chakram Hikers",
    "organization": "Independent",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "NGO focusing on non-profit adventure sports and forest conservation. Recognized for leadership development.",
    "location": "Mumbai",
    "links": { "website": "https://chakramhikers.org" }
  },
  {
    "id": "mum-094",
    "name": "Gorilla Adventures",
    "organization": "Independent",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "Outdoor sports store and tour operator specializing in hiking and climbing. Offers rappelling and valley crossing.",
    "location": "Mumbai",
    "links": { "website": "https://gorillaadventures.in" }
  },
  {
    "id": "mum-095",
    "name": "Let's Get Lost",
    "organization": "Independent",
    "category": "Mountaineering, Trekking, and Adventure Sports",
    "description": "Travel community organizing overnight camps and offbeat weekend getaways. Hosted events at Rajmachi Fort.",
    "location": "Mumbai",
    "links": { "website": "https://letsgetlost.in" }
  },

  // 12. Fashion, Style, and Lifestyle - Collegiate
  {
    "id": "mum-096",
    "name": "Montage Fashion Committee",
    "organization": "NMIMS",
    "category": "Fashion, Style, and Lifestyle",
    "description": "Part of ASMSOC's cultural club; focuses on runway events and professional styling. Organizes 'Vaayu Fashion Week'.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-097",
    "name": "Ami Trendz",
    "organization": "Amity Mumbai",
    "category": "Fashion, Style, and Lifestyle",
    "description": "Style club aimed at honing professional and leadership skills through fashion.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu.in" }
  },
  {
    "id": "mum-098",
    "name": "FAD Department",
    "organization": "MCC",
    "category": "Fashion, Style, and Lifestyle",
    "description": "Departmental association focusing on fashion and interior design. Organized visits to AICTE labs.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  {
    "id": "mum-099",
    "name": "Lifestyle Genre",
    "organization": "IITB Cult",
    "category": "Fashion, Style, and Lifestyle",
    "description": "Umbrella body for style, design, and classical arts within the cultural council. Manages 'Lifestyle GC'.",
    "location": "Mumbai",
    "links": { "website": "https://iitb-culturals.org" }
  },
  {
    "id": "mum-100",
    "name": "Montage Admin/Finance",
    "organization": "NMIMS",
    "category": "Fashion, Style, and Lifestyle",
    "description": "Handles the massive budget and logistics for fashion shows. Successfully managed sponsorships.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  // 12. Fashion, Style, and Lifestyle - Non-Collegiate
  {
    "id": "mum-101",
    "name": "FTP Institute (Fashion Wing)",
    "organization": "Independent",
    "category": "Fashion, Style, and Lifestyle",
    "description": "Provides weekend courses in basic and advanced digital fashion photography. Led by celebrity photographers.",
    "location": "Mumbai",
    "links": { "website": "https://ftpinstitute.com" }
  },
  {
    "id": "mum-102",
    "name": "Kids Fun Club - Creativities",
    "organization": "Independent",
    "category": "Fashion, Style, and Lifestyle",
    "description": "Head of Creativities focusing on new business and creative play for kids in Malabar Hill.",
    "location": "Malabar Hill, Mumbai",
    "links": { "website": "https://kidsfunclub.in" }
  },
  {
    "id": "mum-103",
    "name": "Ami-Psyche (Lifestyle Wing)",
    "organization": "Amity Mumbai",
    "category": "Fashion, Style, and Lifestyle",
    "description": "Focuses on holistic development and emotional well-being as part of university lifestyle.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu.in" }
  },

  // 13. Photography, Cinematography, and Visual Media - Collegiate
  {
    "id": "mum-104",
    "name": "Silverscreen",
    "organization": "IIT Bombay",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "The official film and media club focusing on cinematography and storytelling. Produced high-quality short films.",
    "location": "Mumbai",
    "links": { "website": "https://gymkhana.iitb.ac.in" }
  },
  {
    "id": "mum-105",
    "name": "Snap Squad",
    "organization": "Amity Mumbai",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Dedicated photography club aiming to harness student potential through visual media. Members take part in photo-walks.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu.in" }
  },
  {
    "id": "mum-106",
    "name": "Ami-Cine",
    "organization": "Amity Mumbai",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Movie production club focusing on the technical aspects of filmmaking. Organizes meaningful cultural activities.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu.in" }
  },
  {
    "id": "mum-107",
    "name": "Photography Head",
    "organization": "ICT",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Part of the Technological Association managing the institute's visual documentation. Manages 'Vortex'.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  {
    "id": "mum-108",
    "name": "Media & Creative Production",
    "organization": "VJTI",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Focused on institutional branding and digital media production for student events. Outputs for Technovanza.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  // 13. Photography, Cinematography, and Visual Media - Non-Collegiate
  {
    "id": "mum-109",
    "name": "Photographic Society of India (PSI)",
    "organization": "Independent",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Established in 1937; focuses on promotion and advancement of photographic art. Publishes 'Click Magazine'.",
    "location": "Mumbai",
    "links": { "website": "https://photographicsocietyofindia.com" }
  },
  {
    "id": "mum-110",
    "name": "National Institute of Photography",
    "organization": "Independent",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Offers professional courses in wedding, fashion, and lifestyle photography. Expert instructors in Mumbai.",
    "location": "Mumbai",
    "links": { "website": "https://focusnip.com" }
  },
  {
    "id": "mum-111",
    "name": "Mumbai Weekend Shoot",
    "organization": "Independent",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Independent photography group organizing weekly heritage and street walks. Active on Flickr and Facebook.",
    "location": "Mumbai",
    "links": { "website": "https://mumbaiweekendshoot.in" }
  },
  {
    "id": "mum-112",
    "name": "The Raw Lab",
    "organization": "Independent",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Specialized photography group focusing on high-quality post-production and editing. Rated for creative approach.",
    "location": "Mumbai",
    "links": { "website": "https://therawlab.in" }
  },
  {
    "id": "mum-113",
    "name": "Mumbai Photography Workshops",
    "organization": "Independent",
    "category": "Photography, Cinematography, and Visual Media",
    "description": "Custom-tailored workshops in street photography (Sassoon Docks, Chor Bazaar). Led by experts like Craig Boehman.",
    "location": "Mumbai",
    "links": { "website": "https://craigboehman.com" }
  },

  // 14. Social Service and Community Outreach - Collegiate
  {
    "id": "mum-114",
    "name": "Abhyuday",
    "organization": "IIT Bombay",
    "category": "Social Service and Community Outreach",
    "description": "The social body of IITB focusing on sensitization and hands-on welfare projects. Organized Mumbai's largest blood drives.",
    "location": "Mumbai",
    "links": { "website": "https://abhyudayiitb.org" }
  },
  {
    "id": "mum-115",
    "name": "Social Service League",
    "organization": "St. Xavier's",
    "category": "Social Service and Community Outreach",
    "description": "Operating for over 50 years focusing on altruism and rural work. Conducts 'Project Care'.",
    "location": "Mumbai",
    "links": { "website": "https://xaviers.edu" }
  },
  {
    "id": "mum-116",
    "name": "Social Responsibility Forum",
    "organization": "NMIMS",
    "category": "Social Service and Community Outreach",
    "description": "Conduit for social welfare through exhilarating events and taboo awareness. Organized 'WEvolve'.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-117",
    "name": "Enactus",
    "organization": "NMIMS ASMSOC",
    "category": "Social Service and Community Outreach",
    "description": "Focuses on entrepreneurial action and social innovation through revenue-generating projects. Managed 'Project Neev'.",
    "location": "Mumbai",
    "links": { "website": "https://enactus.org" }
  },
  {
    "id": "mum-118",
    "name": "Social & Community Activities",
    "organization": "VJTI",
    "category": "Social Service and Community Outreach",
    "description": "Faculty-led body overseeing community-focused cultural activities. Collaborates with Matunga Police.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  // 14. Social Service and Community Outreach - Non-Collegiate
  {
    "id": "mum-119",
    "name": "Robin Hood Army (RHA Mumbai)",
    "organization": "Independent",
    "category": "Social Service and Community Outreach",
    "description": "Volunteer-based organization redistributing surplus food from restaurants. Operates 'Robin Hood Academy'.",
    "location": "Mumbai",
    "links": { "website": "https://robinhoodarmy.com" }
  },
  {
    "id": "mum-120",
    "name": "iVolunteer",
    "organization": "Independent",
    "category": "Social Service and Community Outreach",
    "description": "Social enterprise connecting volunteers with high-impact NGO opportunities in Mumbai.",
    "location": "Mumbai",
    "links": { "website": "https://ivolunteer.in" }
  },
  {
    "id": "mum-121",
    "name": "Girija Welfare Association",
    "organization": "Independent",
    "category": "Social Service and Community Outreach",
    "description": "Community-based NGO focusing on health and social development in Mumbai Central. Rated 4.3 stars.",
    "location": "Mumbai Central",
    "links": { "website": "https://girijawelfare.com" }
  },
  {
    "id": "mum-122",
    "name": "Rotary Club of Bombay Bandra",
    "organization": "Independent",
    "category": "Social Service and Community Outreach",
    "description": "Professional network focusing on large-scale community and rural development. Part of global network.",
    "location": "Bandra, Mumbai",
    "links": { "website": "https://rotarybombaybandra.org" }
  },

  // 15. Debating, Public Speaking, and Rhetoric - Collegiate
  {
    "id": "mum-123",
    "name": "DLA Society",
    "organization": "VJTI",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "The only non-technical society in VJTI focusing on quizzes, debates, and MUNs.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-124",
    "name": "Debating Society",
    "organization": "NMIMS ASMSOC",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "Focuses on critical thinking and clear, convincing arguments for corporate readiness.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-125",
    "name": "SAMSOE Debating Division",
    "organization": "School of Economics",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "Undergraduate division focusing on Oxford-style debates. Hosts 'Shastrarth'.",
    "location": "Mumbai",
    "links": { "website": "https://samsoe.nmims.edu" }
  },
  {
    "id": "mum-126",
    "name": "Speaking Genre",
    "organization": "IITB Cult",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "Part of the Culturals council focusing on formal debates and spoken word. Trains teams for international forums.",
    "location": "Mumbai",
    "links": { "website": "https://iitb-culturals.org" }
  },
  {
    "id": "mum-127",
    "name": "NMIMS Mumbai Toastmasters",
    "organization": "NMIMS",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "A specialized collegiate chapter for management students. Integrates Toastmasters curriculum into MBA.",
    "location": "Mumbai",
    "links": { "website": "https://sbm.nmims.edu" }
  },
  // 15. Debating, Public Speaking, and Rhetoric - Non-Collegiate
  {
    "id": "mum-128",
    "name": "Mumbai Toastmasters",
    "organization": "Independent",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "Open community club meeting at R D National College, Bandra West. Est. 2007.",
    "location": "Bandra West, Mumbai",
    "links": { "website": "https://toastmasters.org" }
  },
  {
    "id": "mum-129",
    "name": "The Talking Club",
    "organization": "Independent",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "A massive meetup-based group focusing on unlearning and discussion. 1,711 members.",
    "location": "Navi Mumbai",
    "links": { "website": "https://meetup.com/talkingclub" }
  },
  {
    "id": "mum-130",
    "name": "Mulund Toastmasters",
    "organization": "Independent",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "Community club for Northeast Mumbai focusing on leadership and public speaking. Consistent weekend meetings.",
    "location": "Mulund, Mumbai",
    "links": { "website": "https://mulundtoastmasters.org" }
  },
  {
    "id": "mum-131",
    "name": "South Mumbai Toastmasters (Sobo)",
    "organization": "Independent",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "Elite community club focusing on advanced rhetorical skills and leadership. Meets twice a month.",
    "location": "South Mumbai",
    "links": { "website": "https://toastmasters.org" }
  },
  {
    "id": "mum-132",
    "name": "Expedition Toastmasters Mumbai",
    "organization": "Independent",
    "category": "Debating, Public Speaking, and Rhetoric",
    "description": "Specialized club with professional and educational prerequisites. Focuses on high-level executive communication.",
    "location": "Mumbai",
    "links": { "website": "https://toastmasters.org" }
  },

  // 16. Fine Arts, Painting, and Creative Design - Collegiate
  {
    "id": "mum-133",
    "name": "Fine Arts Society",
    "organization": "VJTI",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "An independent society aiming to nurture the artist within engineering students. Responsible for institutional murals.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-134",
    "name": "PFA (Photography & Fine Arts)",
    "organization": "IITB",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "Dual-focus club promoting sketching, painting, and clay modeling. Organizes 'Fine Arts GC'.",
    "location": "Mumbai",
    "links": { "website": "https://iitb-culturals.org" }
  },
  {
    "id": "mum-135",
    "name": "Montage Fine Arts Wing",
    "organization": "NMIMS",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "ASMSOC's cultural wing focusing on aesthetic stage design and painting.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-136",
    "name": "Art Club of ICT",
    "organization": "ICT",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "Comprises Fine Arts and Performing Arts wings for chemical tech students. Manages 'ManZar' art gallery.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  {
    "id": "mum-137",
    "name": "Fine Arts & Creative Club",
    "organization": "VJTI",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "Faculty-led body focusing on academic integration of fine arts. Managed by Prof. Kavita Fasate.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  // 16. Fine Arts, Painting, and Creative Design - Non-Collegiate
  {
    "id": "mum-138",
    "name": "Bombay Art Society",
    "organization": "Independent",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "Established in 1888; non-profit institution promoting art in the city. Houses three exhibition galleries.",
    "location": "Bandra, Mumbai",
    "links": { "website": "https://bombayartsociety.org" }
  },
  {
    "id": "mum-139",
    "name": "Art Society of India (ASI)",
    "organization": "Independent",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "Established in 1918; landmark institution for visual arts independence. Organizing the 108th All India Annual Art Exhibition.",
    "location": "Mumbai",
    "links": { "website": "https://artsocietyofindia.org" }
  },
  {
    "id": "mum-140",
    "name": "The Fine Arts Society",
    "organization": "Chembur",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "Suburban temple of arts promoting classical culture and aesthetic education. Est. 1962.",
    "location": "Chembur, Mumbai",
    "links": { "website": "https://thefineartssociety.in" }
  },
  {
    "id": "mum-141",
    "name": "Hobby Club (Painting Wing)",
    "organization": "Vidyalankar",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "Vidyalankar Institute’s wing for public art exhibitions and cartoon workshops.",
    "location": "Mumbai",
    "links": { "website": "https://vit.edu.in" }
  },
  {
    "id": "mum-142",
    "name": "Umbrella Painting Workshop",
    "organization": "Independent",
    "category": "Fine Arts, Painting, and Creative Design",
    "description": "Seasonal community group focused on functional and decorative art. Promotes accessible community art.",
    "location": "Suburban Mumbai",
    "links": { "website": "https://mtcultureclub.com" }
  },

  // 17. Literary Arts and Journalistic Writing - Collegiate
  {
    "id": "mum-143",
    "name": "DLA Society",
    "organization": "VJTI",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Manages institutional newsletters (VJ News) and literary seminars. Only non-technical society.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-144",
    "name": "Literary Arts",
    "organization": "IIT Bombay",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Dedicated to prose, poetry, and journalistic writing within the cultural council. Hosts 'Litrati'.",
    "location": "Mumbai",
    "links": { "website": "https://iitb-culturals.org" }
  },
  {
    "id": "mum-145",
    "name": "Literary Association",
    "organization": "MCC",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Organizes 'Art Thou Among Us' and 'Conversations with Authors' events. Managed 'Academicia'.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  {
    "id": "mum-146",
    "name": "Literary Club",
    "organization": "ICT Mumbai",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Manages English and regional literature events for technical students. Part of 'ManZar'.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  {
    "id": "mum-147",
    "name": "Manthan",
    "organization": "ICT Mumbai",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Regional literary and cultural club focusing on Marathi and vernacular arts.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  // 17. Literary Arts and Journalistic Writing - Non-Collegiate
  {
    "id": "mum-148",
    "name": "Broke Bibliophiles",
    "organization": "Independent",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Mumbai chapter aiming to build a massive community of bibliophiles. Organizes theme-based meetings.",
    "location": "Mumbai",
    "links": { "website": "https://brokebibliophiles.org" }
  },
  {
    "id": "mum-149",
    "name": "Juhu Book Club",
    "organization": "Independent",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Founded in 2006 to review books and talk endlessly about them. Known for monthly shortlisted reviews.",
    "location": "Juhu, Mumbai",
    "links": { "website": "https://juhubookclub.blogspot.com" }
  },
  {
    "id": "mum-150",
    "name": "Bring Your Own Book (BYOB)",
    "organization": "Independent",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Pan-India network chapter allowing members to borrow/lend books for free. Maintains online library.",
    "location": "Mumbai",
    "links": { "website": "https://bringyourownbook.org" }
  },
  {
    "id": "mum-151",
    "name": "Mumbai Bookworms",
    "organization": "Independent",
    "category": "Literary Arts and Journalistic Writing",
    "description": "GoodReads group for 'buddy reads,' reviews, and banter on myriad topics.",
    "location": "Mumbai",
    "links": { "website": "https://goodreads.com" }
  },
  {
    "id": "mum-152",
    "name": "Bound Together Bombay",
    "organization": "Independent",
    "category": "Literary Arts and Journalistic Writing",
    "description": "Free and independent book club meeting at bars/cafes for deep analysis.",
    "location": "Mumbai",
    "links": { "website": "https://boundtogether.in" }
  },

  // 18. Stand-up Comedy and Improvisation - Collegiate
  {
    "id": "mum-153",
    "name": "Comedy Cons",
    "organization": "IIT Bombay",
    "category": "Stand-up Comedy and Improvisation",
    "description": "Official humor club aiming to promote stand-up and improvisation. Organizes 'Humour GC'.",
    "location": "Mumbai",
    "links": { "website": "https://gymkhana.iitb.ac.in" }
  },
  {
    "id": "mum-154",
    "name": "Montage Talent Wing",
    "organization": "NMIMS",
    "category": "Stand-up Comedy and Improvisation",
    "description": "NMIMS branch focusing on identifying and nurturing comedic talent. Hosted 'Open Mic 2022'.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-155",
    "name": "Talent Hunt",
    "organization": "ASMSOC",
    "category": "Stand-up Comedy and Improvisation",
    "description": "Organizes university-level competitions to discover new comedic voices. Feeder for 'Vaayu'.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-156",
    "name": "FunTech Performers",
    "organization": "ICT",
    "category": "Stand-up Comedy and Improvisation",
    "description": "ICT branch dedicated to intra-college comedic and variety performances.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  // 18. Stand-up Comedy and Improvisation - Non-Collegiate
  {
    "id": "mum-157",
    "name": "The Habitat (Khar)",
    "organization": "Independent",
    "category": "Stand-up Comedy and Improvisation",
    "description": "Vibrant community space hosting open-mic nights and live entertainment. Features 'Guftugu' show.",
    "location": "Khar, Mumbai",
    "links": { "website": "https://thehabitat.in" }
  },
  {
    "id": "mum-158",
    "name": "That Comedy Club",
    "organization": "Independent",
    "category": "Stand-up Comedy and Improvisation",
    "description": "Popular venue in Bandra conducting shows Tuesday through Sunday. Witnessed India's finest comedians.",
    "location": "Bandra, Mumbai",
    "links": { "website": "https://thatcomedyclub.com" }
  },
  {
    "id": "mum-159",
    "name": "The Integral Space",
    "organization": "Independent",
    "category": "Stand-up Comedy and Improvisation",
    "description": "South Mumbai hub for 'Women Slay Wednesdays' and open-mic comedy. Focuses on relatable themes.",
    "location": "South Mumbai",
    "links": { "website": "https://theintegralspace.com" }
  },
  {
    "id": "mum-160",
    "name": "Standup Labs (Khar)",
    "organization": "Independent",
    "category": "Stand-up Comedy and Improvisation",
    "description": "Mini comedy club run by comics experimenting with trial and solo shows.",
    "location": "Khar, Mumbai",
    "links": { "website": "https://standuplabs.com" }
  },
  {
    "id": "mum-161",
    "name": "Cuckoo Club (Bandra)",
    "organization": "Independent",
    "category": "Stand-up Comedy and Improvisation",
    "description": "Intimate venue hosting outstation comedians and fresh faces on Thursdays. Attractive setting.",
    "location": "Bandra, Mumbai",
    "links": { "website": "https://thecuckooclub.in" }
  },

  // 19. Electronics and Embedded Systems - Collegiate
  {
    "id": "mum-162",
    "name": "Electronics and Robotics Club (ERC)",
    "organization": "IITB",
    "category": "Electronics and Embedded Systems",
    "description": "Cater to the institute's electronics community through tinkering and innovation. Conducts 'XLR8'.",
    "location": "Mumbai",
    "links": { "website": "https://tech-iitb.org/clubs/" }
  },
  {
    "id": "mum-163",
    "name": "Tinkerers' Laboratory",
    "organization": "IITB",
    "category": "Electronics and Embedded Systems",
    "description": "Hub for practical solutions; bridges theory with hands-on learning. Features 250+ workstations.",
    "location": "Mumbai",
    "links": { "website": "https://makerspace.iitb.ac.in" }
  },
  {
    "id": "mum-164",
    "name": "EESA (Electrical Eng. Assc.)",
    "organization": "IITB",
    "category": "Electronics and Embedded Systems",
    "description": "Promotes research sharing through 'EE Students' Reading Group'. Organized symposiums on microelectronics.",
    "location": "Mumbai",
    "links": { "website": "https://iitb.ac.in" }
  },
  {
    "id": "mum-165",
    "name": "Ham Radio Club",
    "organization": "IITB",
    "category": "Electronics and Embedded Systems",
    "description": "Amateur radio club focusing on electronics and communication technology. Maintains active base station.",
    "location": "Mumbai",
    "links": { "website": "https://ham.iitb.ac.in" }
  },
  {
    "id": "mum-166",
    "name": "Electronics Association",
    "organization": "MCC",
    "category": "Electronics and Embedded Systems",
    "description": "Organizes 'Electro-Hunt' and 'Electro Quiz' to encourage technical curiosity. Managed 'Sapienza'.",
    "location": "Mumbai",
    "links": { "website": "https://mccblr.edu.in" }
  },
  // 19. Electronics and Embedded Systems - Non-Collegiate
  {
    "id": "mum-167",
    "name": "La Electronics Lab",
    "organization": "Independent",
    "category": "Electronics and Embedded Systems",
    "description": "Premier lab Master Arduino, ESP32, and Raspberry Pi for kids and engineers. Provided accident detection assistance.",
    "location": "Mumbai",
    "links": { "website": "https://laelectronicslab.in" }
  },
  {
    "id": "mum-168",
    "name": "SP Robotics Maker Lab",
    "organization": "Independent",
    "category": "Electronics and Embedded Systems",
    "description": "India's largest chain of Maker Spaces for advanced IoT and VR learning. Trusted by national tech awards.",
    "location": "Mumbai",
    "links": { "website": "https://sproboticworks.com" }
  },
  {
    "id": "mum-169",
    "name": "Makerspace (Shishuvan School)",
    "organization": "Independent",
    "category": "Electronics and Embedded Systems",
    "description": "Creative space for hands-on STEM and arts-integrated projects. Successfully built robots using Arduino.",
    "location": "Mumbai",
    "links": { "website": "https://shishuvan.com" }
  },
  {
    "id": "mum-170",
    "name": "NatureNurture Innovation Lab",
    "organization": "Independent",
    "category": "Electronics and Embedded Systems",
    "description": "Reimagining education with hands-on prototypes and DIY tools. Partners with schools for future innovators.",
    "location": "Mumbai",
    "links": { "website": "https://naturenurture.org" }
  },

  // 20. Robotics, Artificial Intelligence, and Automation - Collegiate
  {
    "id": "mum-171",
    "name": "AUV-IITB",
    "organization": "IITB",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Underwater robotics team developing autonomous exploration vehicles. Competed in international AUVSI.",
    "location": "Mumbai",
    "links": { "website": "https://auv-iitb.org" }
  },
  {
    "id": "mum-172",
    "name": "SRA (Society of Robotics - VJTI)",
    "organization": "VJTI",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Hub for innovation, AI, and embedded systems through exciting projects. Consistent top finisher in hackathons.",
    "location": "Mumbai",
    "links": { "website": "https://sra.vjti.org.in" }
  },
  {
    "id": "mum-173",
    "name": "Mars Rover Team",
    "organization": "IITB",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Designs and fabricates rovers for simulated Martian terrain exploration. Participates in URC.",
    "location": "Mumbai",
    "links": { "website": "https://iitb.ac.in" }
  },
  {
    "id": "mum-174",
    "name": "RAC (Robotics and Automation - TSEC)",
    "organization": "TSEC",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Hands-on sensor interfacing and autonomous system assembly workshops. Developed IoT cloud apps.",
    "location": "Mumbai",
    "links": { "website": "https://tsecmumbai.in" }
  },
  {
    "id": "mum-175",
    "name": "AI Community",
    "organization": "IITB",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Collaborative community for everything related to Artificial Intelligence. Conducts neural network workshops.",
    "location": "Mumbai",
    "links": { "website": "https://iitb.ac.in" }
  },
  // 20. Robotics, Artificial Intelligence, and Automation - Non-Collegiate
  {
    "id": "mum-176",
    "name": "i-RoboChakra",
    "organization": "Independent",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Complete STEAM education focusing on robotics, AI, and space technology. Trusted by 2000+ parents.",
    "location": "Mumbai",
    "links": { "website": "https://irobochakra.com" }
  },
  {
    "id": "mum-177",
    "name": "CreativeLinks Club",
    "organization": "Independent",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Empowering children with problem-solving using Lego Robotics tools. Prepared children to thrive in the age of AI.",
    "location": "Mumbai",
    "links": { "website": "https://creativelinksclub.com" }
  },
  {
    "id": "mum-178",
    "name": "Makerspace (Mumbai Port)",
    "organization": "Independent",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Innovation lab where learning becomes interactive, practical, and fun. Partners with learning centers.",
    "location": "Mumbai Port",
    "links": { "website": "https://naturenurture.org" }
  },
  {
    "id": "mum-179",
    "name": "SP Robotics Maker Lab",
    "organization": "Independent",
    "category": "Robotics, Artificial Intelligence, and Automation",
    "description": "Edu-tainment center to build robots, drones, and android apps in Mumbai. India's No. 1 robotics chain.",
    "location": "Mumbai",
    "links": { "website": "https://sproboticworks.com" }
  },

  // 21. Cultural Umbrella Bodies and Regional Sanghams - Collegiate
  {
    "id": "mum-180",
    "name": "Technological Association (ICT)",
    "organization": "ICT",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "Umbrella student body (est. 1934) managing all technical and cultural fests. Organizes 'ManZar'.",
    "location": "Mumbai",
    "links": { "website": "https://ictmumbai.edu.in" }
  },
  {
    "id": "mum-181",
    "name": "Culturals @IITB",
    "organization": "IITB",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "The primary body responsible for dance, music, literary arts, and lifestyle. Manages Mood Indigo.",
    "location": "Mumbai",
    "links": { "website": "https://iitb-culturals.org" }
  },
  {
    "id": "mum-182",
    "name": "Pratibimb Council",
    "organization": "VJTI",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "National cultural festival reflecting energy, enthusiasm, and camaraderie. Organized three-day extravaganzas.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-183",
    "name": "Montage (NMIMS)",
    "organization": "NMIMS",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "Cultural club believing in interconnecting art forms for a taste of all crafts.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-184",
    "name": "Ami-Cult",
    "organization": "Amity Mumbai",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "Performing arts body aiming to harness potential through cultural events. Organizes meaningful activities.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu.in" }
  },
  // 21. Cultural Umbrella Bodies and Regional Sanghams - Non-Collegiate
  {
    "id": "mum-185",
    "name": "Mumbai Tamil Sangham",
    "organization": "Independent",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "Promotes Tamil language, literature, and cultural heritage in Mumbai. Landmark organization for the Tamil community.",
    "location": "Mumbai",
    "links": { "website": "https://mumbaitamilsangham.in" }
  },
  {
    "id": "mum-186",
    "name": "Telugu Sahitya Samiti",
    "organization": "Independent",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "Dedicated to Telugu literature and regional cultural preservation. Hub for Telugu population in Chembur East.",
    "location": "Chembur East, Mumbai",
    "links": { "website": "https://tssmumbai.org" }
  },
  {
    "id": "mum-187",
    "name": "Navi Mumbai Bihar Association",
    "organization": "Independent",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "Promotes the welfare and heritage of the Bihari diaspora in Navi Mumbai. Organizes Chhath Puja.",
    "location": "Navi Mumbai",
    "links": { "website": "https://nmbahome.in" }
  },
  {
    "id": "mum-188",
    "name": "New Acropolis Cultural Org",
    "organization": "Independent",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "International school of philosophy hosting 'Living Philosophy' talks and art. Aiming for cultural unlearning.",
    "location": "Mumbai",
    "links": { "website": "https://acropolis.org.in" }
  },
  {
    "id": "mum-189",
    "name": "Kerala Kala Samithi",
    "organization": "Independent",
    "category": "Cultural Umbrella Bodies and Regional Sanghams",
    "description": "Dedicated to preserving the rich artistic and literary culture of Kerala in Mumbai. Hosts Kathakali.",
    "location": "Mumbai",
    "links": { "website": "https://kksmumbai.in" }
  },

  // 22. Business, Entrepreneurship, and Startups - Collegiate
  {
    "id": "mum-190",
    "name": "E-Cell (IIT Bombay)",
    "organization": "IIT Bombay",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Manifest the latent entrepreneurial spirit through mentorship and funding. Organizes 'Eureka!'.",
    "location": "Mumbai",
    "links": { "website": "https://ecell.in" }
  },
  {
    "id": "mum-191",
    "name": "E-Cell (VJTI Mumbai)",
    "organization": "VJTI",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Role in promoting entrepreneurship; transforms ideas into institutions. Provides mentors.",
    "location": "Mumbai",
    "links": { "website": "https://vjti.ac.in" }
  },
  {
    "id": "mum-192",
    "name": "SOMA (SJMSOM IITB)",
    "organization": "IITB",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "School of Management Association focusing on peer learning and activities. Oversees functional clubs.",
    "location": "Mumbai",
    "links": { "website": "https://som.iitb.ac.in" }
  },
  {
    "id": "mum-193",
    "name": "E-Cell (NMIMS ASMSOC)",
    "organization": "NMIMS",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Bridging the gap between 'I think' and 'I do' for budding entrepreneurs. Organized 'Reverse Shark Tank'.",
    "location": "Mumbai",
    "links": { "website": "https://commerce.nmims.edu" }
  },
  {
    "id": "mum-194",
    "name": "Ami-E Cell",
    "organization": "Amity Mumbai",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Dedicated to fostering entrepreneurial skills through professional training. Organizes meaningful activities.",
    "location": "Mumbai",
    "links": { "website": "https://amity.edu.in" }
  },
  // 22. Business, Entrepreneurship, and Startups - Non-Collegiate
  {
    "id": "mum-195",
    "name": "SME Business Club",
    "organization": "Independent",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Professional platform for strategic management and capital access for SMEs. Facilitated national trade.",
    "location": "Mumbai",
    "links": { "website": "https://smebusinessclub.org" }
  },
  {
    "id": "mum-196",
    "name": "India Merchants' Chamber (LW)",
    "organization": "Independent",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Century-old wing focusing on female leadership and business development. Organizes annual 'WE' exhibition.",
    "location": "Churchgate, Mumbai",
    "links": { "website": "https://imcnet.org" }
  },
  {
    "id": "mum-197",
    "name": "Marathi Business Club",
    "organization": "Independent",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Platform for Marathi-speaking business owners to collaborate and grow. Promotes vernacular culture.",
    "location": "Mahim, Mumbai",
    "links": { "website": "https://marathibusinessclub.com" }
  },
  {
    "id": "mum-198",
    "name": "Shamkris Business Club",
    "organization": "Independent",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Focuses on management consulting, ISO training, and strategic growth. Recognized for commitment.",
    "location": "Mumbai",
    "links": { "website": "https://shamkris.com" }
  },
  {
    "id": "mum-199",
    "name": "Indian Business Club",
    "organization": "Independent",
    "category": "Business, Entrepreneurship, and Startups",
    "description": "Dedicated to professional networking and regional trade development in Kurla. Landmark hub for Eastern Suburb.",
    "location": "Kurla, Mumbai",
    "links": { "website": "https://ibcmumbai.in" }
  }
];

const globalPath = '/Users/vaibhavreddy/Demo/easy-club-app/data/global-directory.json';
const globalData = JSON.parse(fs.readFileSync(globalPath, 'utf8'));

// Filter out all current mum- entries
const filteredData = globalData.filter(item => !item.id.startsWith('mum-'));

// Insert after del- entries
const delIndex = filteredData.findLastIndex(item => item.id.startsWith('del-'));
const finalData = [...filteredData.slice(0, delIndex + 1), ...mumbaiData, ...filteredData.slice(delIndex + 1)];

fs.writeFileSync(globalPath, JSON.stringify(finalData, null, 2));
console.log(`Successfully imported ${mumbaiData.length} Mumbai clubs from PDF.`);

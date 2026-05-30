
const fs = require('fs');

const delhiClubs = [
  // CODING
  {
    name: "DevClub",
    organization: "IIT Delhi",
    category: "Coding",
    description: "The primary software development and open-source club at IIT Delhi, building community-driven tech products.",
    location: "Delhi",
    links: { website: "https://devclub.in", instagram: "https://instagram.com/devclub_iitd", linkedin: "https://linkedin.com/company/devclub-iitd" },
    approxMemberCount: "200+", founded: "2018", keyEvents: ["DevDay", "Hackathons"]
  },
  {
    name: "ANCC (Algorithms and Coding Club)",
    organization: "IIT Delhi",
    category: "Coding",
    description: "IIT Delhi's hub for competitive programming, algorithms, and data structures.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/ancc_iitd" },
    approxMemberCount: "150+", founded: "2015", keyEvents: ["Algorythm", "CodeRush"]
  },
  {
    name: "BYLD",
    organization: "IIIT Delhi",
    category: "Coding",
    description: "The software development club of IIIT-Delhi, focusing on project-based learning and software engineering.",
    location: "Delhi",
    links: { website: "https://byld.iiitd.edu.in", instagram: "https://instagram.com/byld.iiitd" },
    approxMemberCount: "100+", founded: "2014", keyEvents: ["Build Week", "Workshops"]
  },
  {
    name: "Foobar",
    organization: "IIIT Delhi",
    category: "Coding",
    description: "Competitive programming club of IIIT-Delhi, hosting weekly contests and algorithm sessions.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/foobar_iiitd" },
    approxMemberCount: "120+", founded: "2012", keyEvents: ["ProSort", "Contests"]
  },
  {
    name: "CSI DTU",
    organization: "DTU",
    category: "Coding",
    description: "Computer Society of India student branch at DTU, active in hackathons and software projects.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/csidtu" },
    approxMemberCount: "300+", founded: "1990", keyEvents: ["HackDTU", "Workshops"]
  },
  {
    name: "IOSD DTU",
    organization: "DTU",
    category: "Coding",
    description: "International Organisation of Software Developers chapter at DTU, focusing on full-stack dev and community.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/iosd_dtu" },
    approxMemberCount: "250+", founded: "2016", keyEvents: ["Code of Honor", "Hackathons"]
  },
  {
    name: "The Debugging Society",
    organization: "NSUT",
    category: "Coding",
    description: "The premier competitive programming society of NSUT, fostering an elite coding culture.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/tds_nsut" },
    approxMemberCount: "180+", founded: "2017", keyEvents: ["HackNSUT", "CodeSprints"]
  },
  {
    name: "CSI NSUT",
    organization: "NSUT",
    category: "Coding",
    description: "CSI student branch at NSUT, focusing on research-oriented coding and project management.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/csi_nsut" },
    approxMemberCount: "200+", founded: "1995", keyEvents: ["NSUT Hacks", "Tech Summits"]
  },
  {
    name: "GDSC NSUT",
    organization: "NSUT",
    category: "Coding",
    description: "Google Developer Student Club at NSUT, bridging the gap between theory and practice for developers.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/gdsc_nsut" },
    approxMemberCount: "500+", founded: "2019", keyEvents: ["Solution Challenge", "Study Jams"]
  },
  {
    name: "Lean In IGDTUW",
    organization: "IGDTUW",
    category: "Coding",
    description: "A community for women in tech at IGDTUW, focusing on coding, mentorship, and career growth.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/leaninigdtuw" },
    approxMemberCount: "300+", founded: "2016", keyEvents: ["SheCodes", "Mentorship Sessions"]
  },
  {
    name: "ACM IGDTUW",
    organization: "IGDTUW",
    category: "Coding",
    description: "The ACM student chapter at IGDTUW, promoting research and innovation in computing.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/acm_igdtuw" },
    approxMemberCount: "200+", founded: "2012", keyEvents: ["Innerscore", "Workshops"]
  },
  {
    name: "Coding Ninjas SSCBS",
    organization: "SSCBS",
    category: "Coding",
    description: "A student-led tech community at Shaheed Sukhdev College of Business Studies, focusing on data structures and logic.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/codingninjas_sscbs" },
    approxMemberCount: "100+", founded: "2018", keyEvents: ["Code Wars", "Coding Bootcamps"]
  },

  // ROBOTICS
  {
    name: "Robotics Club",
    organization: "IIT Delhi",
    category: "Robotics",
    description: "The central hub for robotics at IIT Delhi, participating in national and international competitions like ABU Robocon.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/roboticsclub_iitd" },
    approxMemberCount: "150+", founded: "2002", keyEvents: ["RoboWars", "Workshops"]
  },
  {
    name: "Cyborg",
    organization: "IIIT Delhi",
    category: "Robotics",
    description: "The robotics and hardware club of IIIT-Delhi, focusing on drones, automation, and IoT.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/cyborg_iiitd" },
    approxMemberCount: "80+", founded: "2010", keyEvents: ["Drone Racing", "Arduino Sessions"]
  },
  {
    name: "Robotics Club",
    organization: "DTU",
    category: "Robotics",
    description: "One of the most active robotics societies in India, specializing in autonomous vehicles and humanoid bots.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/robotics_dtu" },
    approxMemberCount: "200+", founded: "1990", keyEvents: ["RoboFest", "National Competitions"]
  },
  {
    name: "Control Delvers",
    organization: "NSUT",
    category: "Robotics",
    description: "Technical society of NSUT focusing on control systems, robotics, and automation research.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/controldelvers_nsut" },
    approxMemberCount: "100+", founded: "2005", keyEvents: ["Tech Mazes", "RoboSumo"]
  },

  // ELECTRONICS
  {
    name: "Electroholics",
    organization: "IIIT Delhi",
    category: "Electronics",
    description: "Hardware enthusiasts group at IIIT-Delhi, dedicated to VLSI, circuit design, and embedded systems.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/electroholics_iiitd" },
    approxMemberCount: "70+", founded: "2011", keyEvents: ["Circuit Design Contests", "PCB Workshops"]
  },
  {
    name: "IEEE IIT Delhi",
    organization: "IIT Delhi",
    category: "Electronics",
    description: "Student branch of IEEE at IIT Delhi, promoting technical excellence in electrical and electronics engineering.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/ieee_iitd" },
    approxMemberCount: "300+", founded: "1980", keyEvents: ["Technical Summits", "Paper Presentations"]
  },

  // RACING
  {
    name: "Deltech Racing",
    organization: "DTU",
    category: "Racing",
    description: "Formula Student team from DTU, designing and building high-performance race cars for global competitions.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/deltech_racing" },
    approxMemberCount: "50+", founded: "2003", keyEvents: ["Formula Bharat", "FS Germany"]
  },
  {
    name: "Team Defianz Racing",
    organization: "DTU",
    category: "Racing",
    description: "Pioneering Formula Student team at DTU, representing India at global tracks like Silverstone.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/defianzracing" },
    approxMemberCount: "40+", founded: "2003", keyEvents: ["Formula Student UK"]
  },
  {
    name: "Team GTU",
    organization: "NSUT",
    category: "Racing",
    description: "NSUT's official Formula Student team, building formula-style cars from scratch.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/teamgtu_nsut" },
    approxMemberCount: "45+", founded: "2008", keyEvents: ["Supra SAEIndia"]
  },

  // THEATRE/ACTING
  {
    name: "Ankahi",
    organization: "IIT Delhi",
    category: "Theatre/Acting",
    description: "The dramatics society of IIT Delhi, known for soul-stirring street plays and grand stage productions.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/ankahi_iitd" },
    approxMemberCount: "80+", founded: "1980", keyEvents: ["Pantomime", "Street Plays"]
  },
  {
    name: "Pratibimb",
    organization: "DTU",
    category: "Theatre/Acting",
    description: "The official dramatics society of DTU, a powerhouse in the Delhi street theater (Nukkad) circuit.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/pratibimb.dtu" },
    approxMemberCount: "100+", founded: "1990", keyEvents: ["Nukkad Natak", "Annual Production"]
  },
  {
    name: "Ashwamedh",
    organization: "NSUT",
    category: "Theatre/Acting",
    description: "NSUT's premier dramatics society, legendary for its performance intensity and social impact plays.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/ashwamedh_nsut" },
    approxMemberCount: "110+", founded: "1995", keyEvents: ["Street Play Nationals"]
  },
  {
    name: "Ibtida",
    organization: "Hindu College",
    category: "Theatre/Acting",
    description: "One of DU's most iconic dramatics societies, founded by Imtiaz Ali, known for artistic excellence.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/ibtida.hindu" },
    approxMemberCount: "90+", founded: "1990", keyEvents: ["Medina", "Nukkad"]
  },
  {
    name: "The Players",
    organization: "Kirori Mal College",
    category: "Theatre/Acting",
    description: "Prestigious dramatics society of KMC with a legacy of producing world-class actors and directors.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/theplayers.kmc" },
    approxMemberCount: "80+", founded: "1958", keyEvents: ["Stage Plays", "Street Drama"]
  },
  {
    name: "Shunya",
    organization: "Ramjas College",
    category: "Theatre/Acting",
    description: "Ramjas College's dramatics society, known for its bold and unconventional theatrical experiments.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/shunya_ramjas" },
    approxMemberCount: "70+", founded: "1992", keyEvents: ["Nukkad Natak", "Stage Experiments"]
  },

  // DANCE
  {
    name: "V-Defyn",
    organization: "IIT Delhi",
    category: "Dance",
    description: "The western dance society of IIT Delhi, masters of hip-hop and urban dance styles.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/vdefyn_iitd" },
    approxMemberCount: "40+", founded: "2000", keyEvents: ["Dance Competitions", "Rendezvous"]
  },
  {
    name: "Dhoom",
    organization: "DTU",
    category: "Dance",
    description: "The western dance society of DTU, known for high-energy performances and national titles.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/dhoom_dtu" },
    approxMemberCount: "50+", founded: "1995", keyEvents: ["Engifest Performance"]
  },
  {
    name: "Mirage",
    organization: "NSUT",
    category: "Dance",
    description: "The western dance society of NSUT, bringing urban and contemporary styles to the stage.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/mirage_nsut" },
    approxMemberCount: "45+", founded: "2002", keyEvents: ["National Dance Contests"]
  },
  {
    name: "Misba",
    organization: "SGTB Khalsa",
    category: "Dance",
    description: "DU's elite western dance society, consistently ranked at the top of the university circuit.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/misba_khalsa" },
    approxMemberCount: "40+", founded: "1998", keyEvents: ["University Dance Wins"]
  },

  // SINGING / MUSIC
  {
    name: "Madhurima",
    organization: "DTU",
    category: "Singing",
    description: "The music and singing society of DTU, covering classical, semi-classical, and light music.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/madhurima_dtu" },
    approxMemberCount: "60+", founded: "1990", keyEvents: ["Annual Concert", "Antakshari"]
  },
  {
    name: "Crescendo",
    organization: "NSUT",
    category: "Singing",
    description: "The music society of NSUT, featuring a versatile range of vocalists and instrumentalists.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/crescendo_nsut" },
    approxMemberCount: "50+", founded: "1998", keyEvents: ["Unplugged Nights", "NSUT Fest"]
  },
  {
    name: "Swaranjali",
    organization: "Hansraj College",
    category: "Singing",
    description: "The music society of Hansraj College, a premier group for Indian and semi-classical music.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/swaranjali_hansraj" },
    approxMemberCount: "55+", founded: "1992", keyEvents: ["Classical Evenings"]
  },

  // BUSINESS
  {
    name: "FIC SRCC (Finance and Investment Cell)",
    organization: "SRCC",
    category: "Business",
    description: "Asia's premier student-led finance cell, focusing on investment, economics, and portfolio management.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/fic_srcc", website: "https://ficsrcc.com" },
    approxMemberCount: "100+", founded: "2010", keyEvents: ["Episteme", "Bullzire"]
  },
  {
    name: "Marketing Society",
    organization: "SRCC",
    category: "Business",
    description: "The leading marketing student body at SRCC, focusing on branding, strategy, and market research.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/marksoc_srcc" },
    approxMemberCount: "80+", founded: "2012", keyEvents: ["Market Mania", "Case Studies"]
  },
  {
    name: "E-Cell",
    organization: "DTU",
    category: "Business",
    description: "Entrepreneurship Cell of DTU, fostering startup culture and providing incubation support.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/ecell_dtu", website: "https://ecelldtu.in" },
    approxMemberCount: "150+", founded: "2008", keyEvents: ["E-Summit", "B-Plan Competitions"]
  },
  {
    name: "Consulting Club",
    organization: "IIT Delhi",
    category: "Business",
    description: "The consulting hub at IIT Delhi, preparing students for careers in top-tier strategy and management consulting.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/consulting_iitd" },
    approxMemberCount: "100+", founded: "2015", keyEvents: ["Case Workshops", "Corporate Meets"]
  },

  // PHOTOGRAPHY
  {
    name: "PVC (Photography and Video Club)",
    organization: "IIT Delhi",
    category: "Photography",
    description: "The central visual arts club of IIT Delhi, capturing campus life and events.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/pvc_iitd" },
    approxMemberCount: "60+", founded: "1985", keyEvents: ["Exhibitions", "Photo Walks"]
  },
  {
    name: "Tasveer",
    organization: "IIIT Delhi",
    category: "Photography",
    description: "The photography club of IIIT-Delhi, focusing on digital art and visual storytelling.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/tasveer_iiitd" },
    approxMemberCount: "50+", founded: "2010", keyEvents: ["Photo Contests", "Workshops"]
  },

  // DEBATING
  {
    name: "Debating Society",
    organization: "SRCC",
    category: "Debating",
    description: "SRCC's hub for intellectual discourse and parliamentary debating at the national level.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/debsoc_srcc" },
    approxMemberCount: "120+", founded: "1990", keyEvents: ["SRCC Debate"]
  },
  {
    name: "The Debating Society",
    organization: "DTU",
    category: "Debating",
    description: "DTU's official debating body, participating in major national circuits.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/debsoc_dtu" },
    approxMemberCount: "80+", founded: "1995", keyEvents: ["DTU PD"]
  },

  // SOCIAL SERVICE
  {
    name: "NSS IIT Delhi",
    organization: "IIT Delhi",
    category: "Social Service",
    description: "The national service scheme unit of IIT Delhi, working on rural development and literacy projects.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/nss_iitd" },
    approxMemberCount: "1000+", founded: "1969", keyEvents: ["Kaizen", "Blood Drives"]
  },
  {
    name: "Enactus SRCC",
    organization: "SRCC",
    category: "Social Service",
    description: "Social entrepreneurship club at SRCC, launching businesses that solve social and environmental issues.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/enactus_srcc" },
    approxMemberCount: "150+", founded: "2007", keyEvents: ["Project Asbah", "Virasat"]
  },

  // FASHION
  {
    name: "Glam",
    organization: "IIT Delhi",
    category: "Fashion",
    description: "The fashion and lifestyle society of IIT Delhi, known for high-fashion runway shows.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/glam_iitd" },
    approxMemberCount: "35+", founded: "2005", keyEvents: ["Rendezvous Fashion Show"]
  },
  {
    name: "Galalite",
    organization: "DTU",
    category: "Fashion",
    description: "The fashion society of DTU, bringing glamour and style to the technical campus.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/galalite_dtu" },
    approxMemberCount: "40+", founded: "2008", keyEvents: ["Engifest Couture"]
  },

  // FINE ARTS
  {
    name: "Fine Arts Society",
    organization: "IIT Delhi",
    category: "Fine Arts",
    description: "The creative heart of IIT Delhi, focusing on painting, sketching, and digital art.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/finearts_iitd" },
    approxMemberCount: "60+", founded: "1980", keyEvents: ["Art Gala", "Graffiti Events"]
  },

  // LITERARY
  {
    name: "BSP (Board for Student Publications)",
    organization: "IIT Delhi",
    category: "Literary",
    description: "IIT Delhi's official literary and publishing body, producing campus magazines and news.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/bsp_iitd" },
    approxMemberCount: "150+", founded: "1965", keyEvents: ["Literary Fest", "Inception"]
  },

  // ASTRONOMY/SPACE
  {
    name: "Astronomy Club",
    organization: "IIT Delhi",
    category: "Astronomy/Space",
    description: "The hub for space enthusiasts at IIT Delhi, organizing star-gazing and astrophysics workshops.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/astronomy_iitd" },
    approxMemberCount: "80+", founded: "2005", keyEvents: ["Star Gazing", "Rocketry"]
  },
  {
    name: "Nakshatra",
    organization: "DTU",
    category: "Astronomy/Space",
    description: "The astronomy society of DTU, exploring the cosmos and hosting astronomical events.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/nakshatra_dtu" },
    approxMemberCount: "70+", founded: "2010", keyEvents: ["Observational Camps"]
  },

  // PHYSICS/MATH/BIO/CHEM
  {
    name: "Physics Society",
    organization: "St. Stephen's College",
    category: "Physics",
    description: "A community for physics enthusiasts at St. Stephen's, focusing on theoretical and experimental science.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/physicssoc_stephens" },
    approxMemberCount: "60+", founded: "1950", keyEvents: ["Physics Colloquium"]
  },
  {
    name: "Math Society",
    organization: "SRCC",
    category: "Math",
    description: "Promoting mathematical logic and analytical thinking at SRCC.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/mathsoc_srcc" },
    approxMemberCount: "50+", founded: "2000", keyEvents: ["Math Riddles", "Workshops"]
  },

  // COMEDY
  {
    name: "Funny Side Up",
    organization: "DTU",
    category: "Comedy",
    description: "The official stand-up and humor society of DTU, fostering the next generation of comics.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/funnysideup_dtu" },
    approxMemberCount: "30+", founded: "2015", keyEvents: ["Open Mics", "Stand-up Competitions"]
  },

  // MOUNTAINEERING
  {
    name: "Mountaineering Club",
    organization: "IIT Delhi",
    category: "Mountaineering",
    description: "The adventure and mountaineering body of IIT Delhi, organizing treks and rock climbing sessions.",
    location: "Delhi",
    links: { instagram: "https://instagram.com/mcb_iitd" },
    approxMemberCount: "100+", founded: "1970", keyEvents: ["Himalayan Treks", "Climbing Camps"]
  }
];

const processedDelhi = delhiClubs.map((club, index) => ({
  id: `del-${String(index + 1).padStart(3, '0')}`,
  ...club
}));

const existingData = JSON.parse(fs.readFileSync('/Users/vaibhavreddy/Demo/easy-club-app/data/global-directory.json', 'utf8'));

// Filter out old Delhi entries
const filteredData = existingData.filter(c => c.location !== 'Delhi' && c.location !== 'Delhi, India' && c.location !== 'Delhi NCR' && !c.id.startsWith('del-'));

// Merge
const finalData = [...filteredData, ...processedDelhi];

fs.writeFileSync('/Users/vaibhavreddy/Demo/easy-club-app/data/global-directory.json', JSON.stringify(finalData, null, 2));
console.log(`Successfully archived ${processedDelhi.length} Delhi clubs.`);

const fs = require('fs');

const data = [
  // 1. Biological Sciences and Biotechnology - Collegiate
  {
    "id": "del-001",
    "name": "iGEM Club",
    "organization": "IIT Delhi",
    "category": "Biological Sciences and Biotechnology",
    "description": "Focuses on engineering biological systems; participates in global iGEM competitions.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in/clubs" }
  },
  {
    "id": "del-002",
    "name": "BETA",
    "organization": "IIT Delhi",
    "category": "Biological Sciences and Biotechnology",
    "description": "The Biotech Society; networking for industry and academia research.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in/societies" }
  },
  {
    "id": "del-003",
    "name": "CyFuse",
    "organization": "IIIT Delhi",
    "category": "Biological Sciences and Biotechnology",
    "description": "Tackles multi-domain problems by combining biotech with computing.",
    "location": "Delhi",
    "links": { "website": "https://studentcouncil.iiitd.edu.in" }
  },
  {
    "id": "del-004",
    "name": "Division of Biotech",
    "organization": "NSUT",
    "category": "Biological Sciences and Biotechnology",
    "description": "Core engineering and research in applied life sciences.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  // 1. Biological Sciences and Biotechnology - Non-Collegiate
  {
    "id": "del-005",
    "name": "Doctor Eduzone",
    "organization": "Independent",
    "category": "Biological Sciences and Biotechnology",
    "description": "Medical and bio-preparation; provides structured materials and lab workshops.",
    "location": "Mughal Canal, Delhi",
    "links": { "website": "https://doctoreduzone.com" }
  },
  {
    "id": "del-006",
    "name": "Mavin 4 Science",
    "organization": "Independent",
    "category": "Biological Sciences and Biotechnology",
    "description": "Advanced science education with lab facilities. Rating: 5.0.",
    "location": "Anand Vihar, Delhi",
    "links": { "website": "https://mavin4science.com" } // Assuming website exists or via portal
  },
  {
    "id": "del-007",
    "name": "Scienza Education",
    "organization": "Independent",
    "category": "Biological Sciences and Biotechnology",
    "description": "Applied biological workshops and practical science training. Rating: 5.0.",
    "location": "Railway Road, Delhi",
    "links": { "website": "https://scienzaeducation.com" }
  },

  // 2. Mathematical Sciences - Collegiate
  {
    "id": "del-008",
    "name": "MathSoc",
    "organization": "IIT Delhi",
    "category": "Mathematical Sciences",
    "description": "Pure and applied math research; organizes inter-college contests. Institute-wide.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in" }
  },
  {
    "id": "del-009",
    "name": "Évariste",
    "organization": "IIIT Delhi",
    "category": "Mathematical Sciences",
    "description": "Known for 'Zero Prerequisite Contests' (ZPT) and Speed Proving Tournaments. Student-driven.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/evariste_iiitd" }
  },
  {
    "id": "del-010",
    "name": "Aryabhata Club",
    "organization": "Sparsh Intl",
    "category": "Mathematical Sciences",
    "description": "Foundation mathematics and regional Olympiad preparation. School-level.",
    "location": "Delhi",
    "links": { "website": "https://sparshinternational.co.in" }
  },
  {
    "id": "del-011",
    "name": "Comp. & Math Soc",
    "organization": "SRCC",
    "category": "Mathematical Sciences",
    "description": "Fosters interest in computing, high-level logic, and proofs. Departmental.",
    "location": "Delhi",
    "links": { "website": "https://srcc.edu/societies" }
  },
  // 2. Mathematical Sciences - Non-Collegiate
  {
    "id": "del-012",
    "name": "Radiance Maths",
    "organization": "Independent",
    "category": "Mathematical Sciences",
    "description": "Specialized coaching for advanced concepts; small batch sizes.",
    "location": "West Delhi",
    "links": { "instagram": "https://instagram.com/radiancemaths" }
  },
  {
    "id": "del-013",
    "name": "Achievers Classes",
    "organization": "Independent",
    "category": "Mathematical Sciences",
    "description": "High ratings for multi-disciplinary math training; interest-free EMI.",
    "location": "East Delhi",
    "links": { "website": "https://achieversclasses.com" }
  },
  {
    "id": "del-014",
    "name": "Likhavat Academy",
    "organization": "Independent",
    "category": "Mathematical Sciences",
    "description": "Handwriting and high-logic math classes for hobbyists. Rating: 4.9.",
    "location": "Kamla Nagar, Delhi",
    "links": { "website": "https://likhavat.com" }
  },

  // 3. Physics - Collegiate
  {
    "id": "del-015",
    "name": "PhySoc",
    "organization": "IIT Delhi",
    "category": "Physics",
    "description": "Theoretical physics research and guest lectures by national scientists.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in" }
  },
  {
    "id": "del-016",
    "name": "PAC (Physics & Astronomy Club)",
    "organization": "IIT Delhi",
    "category": "Physics",
    "description": "Practical star-gazing and shell model research. Loc: WS120.",
    "location": "Delhi",
    "links": { "website": "https://pac.iitd.ac.in" }
  },
  {
    "id": "del-017",
    "name": "Physics Society",
    "organization": "St. Stephen's",
    "category": "Physics",
    "description": "Historical society focused on classical and modern physics inquiry.",
    "location": "Delhi",
    "links": { "website": "https://ststephens.edu" }
  },
  // 3. Physics - Non-Collegiate
  {
    "id": "del-018",
    "name": "Pandeys Tutorials",
    "organization": "Independent",
    "category": "Physics",
    "description": "Concept-based physics using smartboards and personal batches (<10). Rating: 5.0.",
    "location": "North Delhi",
    "links": { "website": "https://pandeystutorials.com" }
  },
  {
    "id": "del-019",
    "name": "Manocha Classes",
    "organization": "Independent",
    "category": "Physics",
    "description": "Highly recommended for competitive physics and study environments. Rating: 5.0.",
    "location": "South Delhi",
    "links": { "website": "https://manochaclasses.com" }
  },
  {
    "id": "del-020",
    "name": "Bys Career Academy",
    "organization": "Independent",
    "category": "Physics",
    "description": "Specialized teaching and motivation programs for PCB subjects. Tel: +91-8506876628.",
    "location": "NCR-wide",
    "links": { "website": "https://byscareeracademy.com" }
  },

  // 4. Chemistry - Collegiate
  {
    "id": "del-021",
    "name": "Chemocronies",
    "organization": "IIT Delhi",
    "category": "Chemistry",
    "description": "Departmental society for Chemical Engineering and pure chemistry research.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in" }
  },
  {
    "id": "del-022",
    "name": "Periodic Pioneers",
    "organization": "Sparsh Intl",
    "category": "Chemistry",
    "description": "Lab-based activities to foster early interest in organic/inorganic chemistry.",
    "location": "Delhi",
    "links": { "website": "https://sparshinternational.co.in" }
  },
  {
    "id": "del-023",
    "name": "Chemistry Society",
    "organization": "St. Stephen's",
    "category": "Chemistry",
    "description": "Organizes guest lectures and annual academic festivals (SQLs).",
    "location": "Delhi",
    "links": { "website": "https://ststephens.edu" }
  },
  // 4. Chemistry - Non-Collegiate
  {
    "id": "del-024",
    "name": "PCBM Career Inst",
    "organization": "Independent",
    "category": "Chemistry",
    "description": "Applied chemistry coaching; noted for well-structured practice sessions. Rating: 5.0.",
    "location": "Central Delhi",
    "links": { "website": "https://pcbmcareer.com" }
  },
  {
    "id": "del-025",
    "name": "Forensic Science WS",
    "organization": "Independent",
    "category": "Chemistry",
    "description": "Offers technical workshops in applied chemistry for forensic investigation.",
    "location": "NCR wide",
    "links": { "website": "https://forensicsciencews.com" }
  },
  {
    "id": "del-026",
    "name": "Sigma Tutorials",
    "organization": "Independent",
    "category": "Chemistry",
    "description": "Offers flexible payment and clean study environments for science prep. Rating: 5.0.",
    "location": "South Delhi",
    "links": { "website": "https://sigmatutorials.com" }
  },

  // 5. Racing and Automotive Engineering - Collegiate
  {
    "id": "del-027",
    "name": "Axlr8r Formula",
    "organization": "IIT Delhi",
    "category": "Racing and Automotive Engineering",
    "description": "1st Indian electric team with two International podiums (Australasia 2020). 30 members.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/acid_iitd" }
  },
  {
    "id": "del-028",
    "name": "NSUT Motorsports",
    "organization": "NSUT",
    "category": "Racing and Automotive Engineering",
    "description": "Focused on internal combustion and prototype racing; active in SAE events.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  {
    "id": "del-029",
    "name": "Bullet Hawk Racing",
    "organization": "NSUT",
    "category": "Racing and Automotive Engineering",
    "description": "Competitive automotive engineering focusing on SAE standards and solar tech.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  {
    "id": "del-030",
    "name": "Automotive Club",
    "organization": "DTU",
    "category": "Racing and Automotive Engineering",
    "description": "Central node for SAE Mini-Baja events; managed by SAC.",
    "location": "Delhi",
    "links": { "website": "https://dtu.ac.in" }
  },
  // 5. Racing and Automotive Engineering - Non-Collegiate
  {
    "id": "del-031",
    "name": "G.O.D.S",
    "organization": "Independent",
    "category": "Racing and Automotive Engineering",
    "description": "Group Of Delhi Superbikers; community for superbike enthusiasts.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/groupofdelhisuperbikers" }
  },
  {
    "id": "del-032",
    "name": "Delhi Cyclists",
    "organization": "Independent",
    "category": "Racing and Automotive Engineering",
    "description": "Largest cycling community in Delhi with 10,000+ members.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/delhicyclists" }
  },
  {
    "id": "del-033",
    "name": "Black Pistons",
    "organization": "Independent",
    "category": "Racing and Automotive Engineering",
    "description": "Performs gravity-defying motorcycle stunts at expos and college festivals.",
    "location": "Delhi",
    "links": { "website": "https://www.facebook.com/BlackPistonsStuntTeam" }
  },

  // 6. Dance - Collegiate
  {
    "id": "del-034",
    "name": "Misba",
    "organization": "GGSCC",
    "category": "Dance",
    "description": "Premier WDS in the DU circuit; high technical precision.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/misba_ggscc" }
  },
  {
    "id": "del-035",
    "name": "Verve",
    "organization": "Sri Venkateswara",
    "category": "Dance",
    "description": "Western Dance; 1st Place in Rev Up Dance Championship 2019.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/verve_svnc" }
  },
  {
    "id": "del-036",
    "name": "Mudra",
    "organization": "JMC",
    "category": "Dance",
    "description": "Excellence in Kathak and Bharatnatyam choreography.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/mudra_jmc" }
  },
  {
    "id": "del-037",
    "name": "Tanz",
    "organization": "Miranda House",
    "category": "Dance",
    "description": "Highly coordinated western dance; consistent show-stoppers.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/tanz_miranda" }
  },
  {
    "id": "del-038",
    "name": "Sensation",
    "organization": "KMC",
    "category": "Dance",
    "description": "Multi-genre dance society; premier performer in Delhi circuit.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/sensation_kmc" }
  },
  {
    "id": "del-039",
    "name": "MadToes",
    "organization": "IIIT Delhi",
    "category": "Dance",
    "description": "Contemporary dance focusing on modern movement and precision.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/madtoes_iiitd" }
  },
  {
    "id": "del-040",
    "name": "Vibe",
    "organization": "DTU",
    "category": "Dance",
    "description": "Covers all forms from Hip-Hop to Belly Dancing; practice at Wind Point.",
    "location": "Delhi",
    "links": { "website": "https://www.facebook.com/VIBEDanceSocietyDTU" }
  },
  // 6. Dance - Non-Collegiate
  {
    "id": "del-041",
    "name": "DanceSmith",
    "organization": "Independent",
    "category": "Dance",
    "description": "India's Best Arts & Dance Production Company for Bollywood/Corporate.",
    "location": "Delhi",
    "links": { "website": "https://dancesmith.com" }
  },
  {
    "id": "del-042",
    "name": "India Dans Theater",
    "organization": "Independent",
    "category": "Dance",
    "description": "24x7 Research Center for Dance; Ballet/Contemporary classes. Tel: 9891814242.",
    "location": "Vasant Kunj, Delhi",
    "links": { "website": "mailto:indiadanstheater@gmail.com" }
  },
  {
    "id": "del-043",
    "name": "PAIPA",
    "organization": "Independent",
    "category": "Dance",
    "description": "Pradeep Adwani’s Institute; specialized classes for kids/adults. Kathak/Western.",
    "location": "Kirti Nagar, Delhi",
    "links": { "website": "https://paipa.in", "instagram": "https://instagram.com/paipa_in" }
  },
  {
    "id": "del-044",
    "name": "Artistic Motion",
    "organization": "Independent",
    "category": "Dance",
    "description": "Professional Individual dance studio; Broadway-style training. Ballet/Jazz. Tel: +91-9871610036.",
    "location": "Rajouri Garden, Delhi",
    "links": { "website": "https://artisticmotion.com" }
  },

  // 7. Singing and Music - Collegiate
  {
    "id": "del-045",
    "name": "Swaranjali",
    "organization": "Hansraj",
    "category": "Singing and Music",
    "description": "Respected DU society; Fusion/Western bands like 'Hansraj Projekt'.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/swaranjalihansraj" }
  },
  {
    "id": "del-046",
    "name": "Musoc",
    "organization": "KMC",
    "category": "Singing and Music",
    "description": "Music society of KMC; won 18+ awards in recent sessions.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/musoc_kmc" }
  },
  {
    "id": "del-047",
    "name": "Madhurima",
    "organization": "DTU",
    "category": "Singing and Music",
    "description": "Central hub for all technical fest musical performances.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/madhurima_dtu" }
  },
  {
    "id": "del-048",
    "name": "Crescendo",
    "organization": "NSUT",
    "category": "Singing and Music",
    "description": "Known for high-energy choral performances and choir excellence.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  {
    "id": "del-049",
    "name": "Dwani",
    "organization": "LSR",
    "category": "Singing and Music",
    "description": "Indian Music Society; 1st prize winner at major inter-college fests.",
    "location": "Delhi",
    "links": { "website": "https://lsr.edu.in" }
  },
  {
    "id": "del-050",
    "name": "AudioBytes",
    "organization": "IIIT Delhi",
    "category": "Singing and Music",
    "description": "Music and production society focused on modern genre jams.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/audiobytes_iiitd" }
  },
  // 7. Singing and Music - Non-Collegiate
  {
    "id": "del-051",
    "name": "Tansen Sangeet",
    "organization": "Independent",
    "category": "Singing and Music",
    "description": "Accredited mahavidyalaya with standardized fees.",
    "location": "Model Town, Delhi",
    "links": { "website": "https://tansensangeet.com" }
  },
  {
    "id": "del-052",
    "name": "Delhi Drum Circle",
    "organization": "Independent",
    "category": "Singing and Music",
    "description": "Casual gatherings for hand-drumming; 19,000+ FB followers.",
    "location": "Hauz Khas, Delhi",
    "links": { "instagram": "https://instagram.com/drumcircleindia" }
  },
  {
    "id": "del-053",
    "name": "Delhi Rock Music",
    "organization": "Independent",
    "category": "Singing and Music",
    "description": "Connects local rock fans for concerts and jam sessions.",
    "location": "Delhi",
    "links": { "website": "https://meetup.com/delhi-rock-music-meetup" }
  },
  {
    "id": "del-054",
    "name": "Rhythmicstan",
    "organization": "Independent",
    "category": "Singing and Music",
    "description": "Professional guitar and vocal training sessions. Tel: +91-9953964667.",
    "location": "South Ex, Delhi",
    "links": { "instagram": "https://instagram.com/rhythmicstan" }
  },

  // 8. Theatre and Acting - Collegiate
  {
    "id": "del-055",
    "name": "Players",
    "organization": "Kirori Mal",
    "category": "Theatre and Acting",
    "description": "Oldest campus theatre group (est. 1959); alumni like Amitabh Bachchan.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/playerskmc" }
  },
  {
    "id": "del-056",
    "name": "Ibtida",
    "organization": "Hindu College",
    "category": "Theatre and Acting",
    "description": "Founded by director Imtiaz Ali (1991); excellence in Street Plays.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/ibtida_hindu" }
  },
  {
    "id": "del-057",
    "name": "Ashwamedh",
    "organization": "NSUT",
    "category": "Theatre and Acting",
    "description": "Dramatics society focusing on team-based artistic expression.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  {
    "id": "del-058",
    "name": "Aveksha",
    "organization": "GGSIPU",
    "category": "Theatre and Acting",
    "description": "The dramatic society of University School of Studies.",
    "location": "Delhi",
    "links": { "website": "https://ipu.ac.in" }
  },
  {
    "id": "del-059",
    "name": "Memesis",
    "organization": "Daulat Ram",
    "category": "Theatre and Acting",
    "description": "Stage/Street theatre; discreet identity in 'neela kurta'.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/memesis_drc" }
  },
  {
    "id": "del-060",
    "name": "Shunya",
    "organization": "Ramjas",
    "category": "Theatre and Acting",
    "description": "Known for out-of-the-box scripts and rigorous 6-round auditions.",
    "location": "Delhi",
    "links": { "website": "https://ramjas.du.ac.in" }
  },
  // 8. Theatre and Acting - Non-Collegiate
  {
    "id": "del-061",
    "name": "Asmita Theatre",
    "organization": "Independent",
    "category": "Theatre and Acting",
    "description": "Social Change; Led by Arvind Gaur; over 60 productions on contemporary issues.",
    "location": "Delhi",
    "links": { "website": "https://asmitatheatre.com", "instagram": "https://instagram.com/asmitatheatre" }
  },
  {
    "id": "del-062",
    "name": "Pierrot's Troupe",
    "organization": "Independent",
    "category": "Theatre and Acting",
    "description": "History/Ghalib; Led by Dr. M. Alam; performed 2,000+ shows globally.",
    "location": "Panchsheel Park, Delhi",
    "links": { "website": "https://www.facebook.com/PierrotsTroupe" }
  },
  {
    "id": "del-063",
    "name": "Dramatech",
    "organization": "Independent",
    "category": "Theatre and Acting",
    "description": "Musicals; Founded by IIT Delhi alumni; Broadway-style productions.",
    "location": "Delhi",
    "links": { "website": "https://dramatech.in" }
  },
  {
    "id": "del-064",
    "name": "Kshitij Theatre",
    "organization": "Independent",
    "category": "Theatre and Acting",
    "description": "Immersive; Intense character development and immersive drama.",
    "location": "Mayur Vihar, Delhi",
    "links": { "website": "https://kshitijtheatregroup.com" }
  },

  // 9. Astronomy and Space - Collegiate
  {
    "id": "del-065",
    "name": "PAC",
    "organization": "IIT Delhi",
    "category": "Astronomy and Space",
    "description": "Observatory management; research in shell models and topology. Loc: WS120.",
    "location": "Delhi",
    "links": { "website": "https://pac.iitd.ac.in" }
  },
  {
    "id": "del-066",
    "name": "Astronuts",
    "organization": "IIIT Delhi",
    "category": "Astronomy and Space",
    "description": "Space simulation (Orbiter); hosted 'Space Race' competitions.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/astronuts_iiitd" }
  },
  {
    "id": "del-067",
    "name": "Astronomy Club",
    "organization": "Sparsh Intl",
    "category": "Astronomy and Space",
    "description": "Early space science education for foundations.",
    "location": "Delhi",
    "links": { "website": "https://sparshinternational.co.in" }
  },
  // 9. Astronomy and Space - Non-Collegiate
  {
    "id": "del-068",
    "name": "Delhi Astro Club",
    "organization": "Independent",
    "category": "Astronomy and Space",
    "description": "Immersive tours in dark-sky locations like Ladakh and NCR. Tel: +91-9599110220.",
    "location": "Delhi",
    "links": { "website": "https://delhiastronomyclub.com" }
  },
  {
    "id": "del-069",
    "name": "AAA Delhi",
    "organization": "Independent",
    "category": "Astronomy and Space",
    "description": "Amateur; Mixed bag of 100+ seasoned astronomers based at Teen Murti.",
    "location": "Delhi",
    "links": { "website": "https://aaadelhi.org" }
  },
  {
    "id": "del-070",
    "name": "Leo Planetaria",
    "organization": "Independent",
    "category": "Astronomy and Space",
    "description": "Education; Portable dome astronomy workshops for schools/adults. Rating: 5.0.",
    "location": "Janakpuri, Delhi",
    "links": { "website": "https://leoplanetaria.com" }
  },

  // 10. Coding and Software Development - Collegiate
  {
    "id": "del-071",
    "name": "DevClub",
    "organization": "IIT Delhi",
    "category": "Coding and Software Development",
    "description": "1,000+ members; built Mercury newsletter system and campus apps.",
    "location": "Delhi",
    "links": { "website": "https://devclub.in" }
  },
  {
    "id": "del-072",
    "name": "ANCC",
    "organization": "IIT Delhi",
    "category": "Coding and Software Development",
    "description": "Algorithms and Coding Club; ICPC preparation focus.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in" }
  },
  {
    "id": "del-073",
    "name": "BYLD",
    "organization": "IIIT Delhi",
    "category": "Coding and Software Development",
    "description": "Software development club building campus tech infrastructure.",
    "location": "Delhi",
    "links": { "website": "https://studentcouncil.iiitd.edu.in" }
  },
  {
    "id": "del-074",
    "name": "d4rkc0de",
    "organization": "IIIT Delhi",
    "category": "Coding and Software Development",
    "description": "Cybersecurity; ranked in Top 10 Indian Teams on CTFTime.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/d4rkc0de_iiitd" }
  },
  {
    "id": "del-075",
    "name": "Programming Club",
    "organization": "DTU",
    "category": "Coding and Software Development",
    "description": "Central node for all DTU technical fests and hackathons.",
    "location": "Delhi",
    "links": { "website": "https://dtu.ac.in" }
  },
  // 10. Coding and Software Development - Non-Collegiate
  {
    "id": "del-076",
    "name": "GDG New Delhi",
    "organization": "Independent",
    "category": "Coding and Software Development",
    "description": "Independent group for open-source talks; 55,000+ members.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/gdgnewdelhi" }
  },
  {
    "id": "del-077",
    "name": "PyDelhi",
    "organization": "Independent",
    "category": "Coding and Software Development",
    "description": "Local Python enthusiasts organizing regular meetups.",
    "location": "Delhi",
    "links": { "website": "https://pydelhi.org" }
  },
  {
    "id": "del-078",
    "name": "ILUGD",
    "organization": "Independent",
    "category": "Coding and Software Development",
    "description": "India Linux Users Group Delhi; noted for networking meetups.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/ilugd" }
  },
  {
    "id": "del-079",
    "name": "Azure Dev Comm",
    "organization": "Independent",
    "category": "Coding and Software Development",
    "description": "Cloud engineers and DevOps practitioners; 1,156 members.",
    "location": "Delhi",
    "links": { "website": "https://commudle.com/azure-delhi" }
  },

  // 11. Mountaineering and Adventure - Collegiate
  {
    "id": "del-080",
    "name": "Hiking Club",
    "organization": "St. Stephen's",
    "category": "Mountaineering and Adventure",
    "description": "Founded 1949; serious expeditions and 'Choose to Dare'.",
    "location": "Delhi",
    "links": { "website": "https://ststephens.edu/hiking-club" }
  },
  {
    "id": "del-081",
    "name": "Escapade Cell",
    "organization": "Kirori Mal",
    "category": "Mountaineering and Adventure",
    "description": "'Who dares wins'; organizes trekking and rafting trips.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/escapade_kmc" }
  },
  {
    "id": "del-082",
    "name": "Hiking Club",
    "organization": "IIT Delhi",
    "category": "Mountaineering and Adventure",
    "description": "Focused on endurance and exploring mountain trails.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/hikingclub_iitd" }
  },
  {
    "id": "del-083",
    "name": "Adventure Club",
    "organization": "IIIT Delhi",
    "category": "Mountaineering and Adventure",
    "description": "Student chapter for outdoor survival and endurance.",
    "location": "Delhi",
    "links": { "website": "https://studentcouncil.iiitd.edu.in" }
  },
  // 11. Mountaineering and Adventure - Non-Collegiate
  {
    "id": "del-084",
    "name": "IMF",
    "organization": "Independent",
    "category": "Mountaineering and Adventure",
    "description": "Indian Mountaineering Foundation; apex body for alpine sports.",
    "location": "Delhi",
    "links": { "website": "https://indmount.org" }
  },
  {
    "id": "del-085",
    "name": "Moxtain",
    "organization": "Independent",
    "category": "Mountaineering and Adventure",
    "description": "Professional club for high-altitude Himalayan expeditions.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/moxtain", "website": "https://moxtain.com" }
  },
  {
    "id": "del-086",
    "name": "Adventure Monk",
    "organization": "Independent",
    "category": "Mountaineering and Adventure",
    "description": "Specialized rock-climbing and camping organization. Rating: 4.8.",
    "location": "Bindapur, Delhi",
    "links": { "website": "https://adventuremonk.in" }
  },
  {
    "id": "del-087",
    "name": "Wild Soul Adv.",
    "organization": "Independent",
    "category": "Mountaineering and Adventure",
    "description": "Group expeditions and high-altitude Himalayan training. Rating: 4.8.",
    "location": "Delhi",
    "links": { "website": "https://wildsoul.com" }
  },

  // 12. Fashion - Collegiate
  {
    "id": "del-088",
    "name": "Glitz",
    "organization": "Kamla Nehru",
    "category": "Fashion",
    "description": "Premier design society in DU; unique themes like 'Naari Shakti'.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/glitz_knc" }
  },
  {
    "id": "del-089",
    "name": "I Vogue",
    "organization": "GGSCC",
    "category": "Fashion",
    "description": "High-stakes performance; winners at major DU festivals.",
    "location": "Delhi",
    "links": { "website": "https://www.facebook.com/IVOGUETheFashionSociety" }
  },
  {
    "id": "del-090",
    "name": "Panache",
    "organization": "NSUT",
    "category": "Fashion",
    "description": "Modeling and runway society; central to the 'Rouge' parade.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  {
    "id": "del-091",
    "name": "Muse",
    "organization": "IIIT Delhi",
    "category": "Fashion",
    "description": "Fashion as form of expression and character portrayal.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/muse_iiitd" }
  },
  {
    "id": "del-092",
    "name": "Campus Vogue",
    "organization": "GGSCC",
    "category": "Fashion",
    "description": "Annual marketing and fashion showcase event.",
    "location": "Delhi",
    "links": { "website": "https://sggscc.ac.in" }
  },
  // 12. Fashion - Non-Collegiate
  {
    "id": "del-093",
    "name": "Delhi Fashion Club",
    "organization": "Independent",
    "category": "Fashion",
    "description": "Promotes textile heritage (Khadi) and new talents globally.",
    "location": "Delhi",
    "links": { "website": "https://delhifashionclub.org", "instagram": "https://instagram.com/delhifashionclub" }
  },
  {
    "id": "del-094",
    "name": "IIP Academy",
    "organization": "Independent",
    "category": "Fashion",
    "description": "Professional BFA/MFA; 100% placement track with brands.",
    "location": "Noida/Delhi",
    "links": { "website": "https://iipacademy.edu.in" }
  },
  {
    "id": "del-095",
    "name": "Satin Models",
    "organization": "Independent",
    "category": "Fashion",
    "description": "Dominant in bridal and ethnic fashion Regional Campaigns. Tel: +91-9899197632.",
    "location": "CP, Delhi",
    "links": { "website": "https://satinmodels.agency" }
  },

  // 13. Photography - Collegiate
  {
    "id": "del-096",
    "name": "Clicks",
    "organization": "DCAC",
    "category": "Photography",
    "description": "Technical documentation for Symphony and DU festivals.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/clicks_dcac" }
  },
  {
    "id": "del-097",
    "name": "Iris",
    "organization": "Gargi College",
    "category": "Photography",
    "description": "Renowned for curated exhibitions and workshops.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/iris_gargi" }
  },
  {
    "id": "del-098",
    "name": "Junoon",
    "organization": "NSUT",
    "category": "Photography",
    "description": "Official photography club curated by campus media.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/junoon_nsut" }
  },
  {
    "id": "del-099",
    "name": "Vivre",
    "organization": "Hindu College",
    "category": "Photography",
    "description": "Famous for high-quality photo-walks and DU archives.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/vivre_hindu" }
  },
  {
    "id": "del-100",
    "name": "FAPS",
    "organization": "KMC",
    "category": "Photography",
    "description": "Fine Arts & Photography; organizes 'Perceptions' flagship event.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/faps_kmc" }
  },
  // 13. Photography - Non-Collegiate
  {
    "id": "del-101",
    "name": "Delhi Photo Club",
    "organization": "Independent",
    "category": "Photography",
    "description": "Professional training and systematic feedback (9.5/10).",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/delhiphotographyclub", "website": "https://delhiphotographyclub.com" }
  },
  {
    "id": "del-102",
    "name": "Delhi College of Photography",
    "organization": "Independent",
    "category": "Photography",
    "description": "Professional faculty and AC studios for advanced learning. Rating: 5.0.",
    "location": "West Delhi",
    "links": { "website": "https://dcop.in" }
  },
  {
    "id": "del-103",
    "name": "Pixel Institute",
    "organization": "Independent",
    "category": "Photography",
    "description": "Noted for 'best teachers' and good learning environment. Rating: 5.0.",
    "location": "Paschim Vihar, Delhi",
    "links": { "website": "https://pixelinstitute.in" }
  },

  // 14. Social Service - Collegiate
  {
    "id": "del-104",
    "name": "Enactus SRCC",
    "organization": "SRCC (DU)",
    "category": "Social Service",
    "description": "Social entrepreneurship; 2nd Runner Up Enactus World Cup 2018.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/enactussrcc", "website": "https://enactussrcc.org" }
  },
  {
    "id": "del-105",
    "name": "SSL",
    "organization": "St. Stephen's",
    "category": "Social Service",
    "description": "Social Service League; legacy of literacy drives and welfare.",
    "location": "Delhi",
    "links": { "website": "https://ststephens.edu" }
  },
  {
    "id": "del-106",
    "name": "Rotaract NSUT",
    "organization": "NSUT",
    "category": "Social Service",
    "description": "Outreach projects and neighborhood intervention models.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  {
    "id": "del-107",
    "name": "Enactus SBSC",
    "organization": "SBSC",
    "category": "Social Service",
    "description": "Projects Karva and Roshni for women/visually impaired.",
    "location": "Delhi",
    "links": { "website": "https://sbs.du.ac.in" }
  },
  // 14. Social Service - Non-Collegiate
  {
    "id": "del-108",
    "name": "CRY",
    "organization": "Independent",
    "category": "Social Service",
    "description": "Child Rights; 4,000+ volunteers; focus on dropout prevention.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/cry_india", "website": "https://cry.org" }
  },
  {
    "id": "del-109",
    "name": "Smile Foundation",
    "organization": "Independent",
    "category": "Social Service",
    "description": "Health/Edu; Helps 600,000+ children annually across India.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/smilefoundationindia", "website": "https://smilefoundationindia.org" }
  },
  {
    "id": "del-110",
    "name": "Satya Shakti",
    "organization": "Independent",
    "category": "Social Service",
    "description": "Healthcare; Elevated social state of 20,000+ marginalized people. Tel: +91-9910957706.",
    "location": "Okhla, Delhi",
    "links": { "website": "https://satyashakti.org" }
  },
  {
    "id": "del-111",
    "name": "Goonj",
    "organization": "Independent",
    "category": "Social Service",
    "description": "Community; 'Cloth for Work' (CFW) and rural infrastructure projects.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/goonj", "website": "https://goonj.org" }
  },

  // 15. Debating - Collegiate
  {
    "id": "del-112",
    "name": "Q.E.D",
    "organization": "Gargi College",
    "category": "Debating",
    "description": "Asian/British Parliamentary; hosted 'Wax Eloquent 24'.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/qed_gargi" }
  },
  {
    "id": "del-113",
    "name": "Debating Society",
    "organization": "Hans Raj",
    "category": "Debating",
    "description": "Reputed English DebSoc; winner at major national circuits.",
    "location": "Delhi",
    "links": { "website": "https://hansrajcollege.ac.in" }
  },
  {
    "id": "del-114",
    "name": "Sahitya",
    "organization": "DTU",
    "category": "Debating",
    "description": "Literary and debating society with 201-500 members.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/sahitya_dtu", "website": "https://theorg.com" }
  },
  {
    "id": "del-115",
    "name": "Vaktritva",
    "organization": "LSR",
    "category": "Debating",
    "description": "Hindi Debating; excellence in Conventional and Mock Parliament.",
    "location": "Delhi",
    "links": { "website": "https://lsr.edu.in" }
  },
  // 15. Debating - Non-Collegiate
  {
    "id": "del-116",
    "name": "ISDS",
    "organization": "Independent",
    "category": "Debating",
    "description": "National Training; Indian Schools Debating Society; 2025 WSDC Champions.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/isds_india", "website": "https://indianschoolsdebatingsociety.com" }
  },
  {
    "id": "del-117",
    "name": "Toastmasters",
    "organization": "Independent",
    "category": "Debating",
    "description": "Public Speaking; Global network for effective oral/written communication. Rating: 4.9.",
    "location": "Gate No. 3 Patel Chowk, Delhi",
    "links": { "website": "https://toastmasters.org" }
  },

  // 16. Fine Arts - Collegiate
  {
    "id": "del-118",
    "name": "Meraki",
    "organization": "IIIT Delhi",
    "category": "Fine Arts",
    "description": "Art appreciation; member of campus technical committees.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/meraki_iiitd" }
  },
  {
    "id": "del-119",
    "name": "Kalakriti",
    "organization": "DTU",
    "category": "Fine Arts",
    "description": "Faculty-led society for traditional Indian arts and crafts.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/kalakriti_dtu" }
  },
  {
    "id": "del-120",
    "name": "Hues",
    "organization": "Gargi College",
    "category": "Fine Arts",
    "description": "Creativity hub focused on sketching and creative expression.",
    "location": "Delhi",
    "links": { "website": "https://gargicollege.in" }
  },
  {
    "id": "del-121",
    "name": "Brushstrokes",
    "organization": "Ramanujan",
    "category": "Fine Arts",
    "description": "Fine arts society with focus on painting and design.",
    "location": "Delhi",
    "links": { "website": "https://ramanujancollege.ac.in" }
  },
  // 16. Fine Arts - Non-Collegiate
  {
    "id": "del-122",
    "name": "NIFA",
    "organization": "Independent",
    "category": "Fine Arts",
    "description": "National Center; Established 2005; fosters excellence in oil painting and BFA.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/nifafinearts", "website": "https://nifafinearts.com" }
  },
  {
    "id": "del-123",
    "name": "Urban Sketchers",
    "organization": "Independent",
    "category": "Fine Arts",
    "description": "Community; Global chapter for on-location sketching in NCR.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/urbansketchersdelhi", "website": "https://urbansketchers.org" }
  },
  {
    "id": "del-124",
    "name": "Thoughts On Canvas",
    "organization": "Independent",
    "category": "Fine Arts",
    "description": "Studio; Creative studio for adult sketching and painting classes. Rating: 5.0.",
    "location": "Ardee City, Delhi",
    "links": { "website": "https://thoughtsoncanvas.com" }
  },

  // 17. Literary - Collegiate
  {
    "id": "del-125",
    "name": "LDA",
    "organization": "IIIT Delhi",
    "category": "Literary",
    "description": "Literature, Debate & Anime; largest society on campus.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/lda_iiitd" }
  },
  {
    "id": "del-126",
    "name": "Quilluminati",
    "organization": "Gargi College",
    "category": "Literary",
    "description": "Creative writing society; South Campus literary hub.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/quilluminati_gargi" }
  },
  {
    "id": "del-127",
    "name": "Expressions",
    "organization": "LSR",
    "category": "Literary",
    "description": "Inclusive creative writing society with a Book Club.",
    "location": "Delhi",
    "links": { "website": "https://lsr.edu.in" }
  },
  {
    "id": "del-128",
    "name": "Ostraca",
    "organization": "Hansraj",
    "category": "Literary",
    "description": "Renowned creative writing and literary discussion hub.",
    "location": "Delhi",
    "links": { "website": "https://hansrajcollege.ac.in" }
  },
  // 17. Literary - Non-Collegiate
  {
    "id": "del-129",
    "name": "Delhi Poetry Slam",
    "organization": "Independent",
    "category": "Literary",
    "description": "Slam/Literary; Hosts Wingword Prize and Slam Retreats; 40,000+ trained.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/delhipoetryslam", "website": "https://delhipoetryslam.com" }
  },
  {
    "id": "del-130",
    "name": "Seedz Club",
    "organization": "Independent",
    "category": "Literary",
    "description": "Community; Delhi's coolest book club for reading and networking.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/seedzclub" }
  },
  {
    "id": "del-131",
    "name": "Yuva Ekta",
    "organization": "Independent",
    "category": "Literary",
    "description": "Arts/Lit; Expressive arts project for dignity and self-worth.",
    "location": "Delhi",
    "links": { "website": "https://yuvaektafoundation.org" }
  },

  // 18. Comedy - Collegiate
  {
    "id": "del-132",
    "name": "Mr. & Mrs. Moksha",
    "organization": "NSUT",
    "category": "Comedy",
    "description": "Humor Fest; High-engagement student talent platform.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  {
    "id": "del-133",
    "name": "Kavi Samellan",
    "organization": "NSUT",
    "category": "Comedy",
    "description": "Humorous Poetry; Traditional poetry meets comedic flair.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  // 18. Comedy - Non-Collegiate
  {
    "id": "del-134",
    "name": "The Laugh Store",
    "organization": "Independent",
    "category": "Comedy",
    "description": "Professional; Vegas Mall dedicated venue; hosts stars like Zakir Khan. Tel: 9958869696.",
    "location": "Vegas Mall, Delhi",
    "links": { "instagram": "https://instagram.com/thelaughstorein" }
  },
  {
    "id": "del-135",
    "name": "Canvas Laugh Club",
    "organization": "Independent",
    "category": "Comedy",
    "description": "OG Hub; CyberHub/DLF Mall; where legends were born.",
    "location": "CyberHub/DLF Mall",
    "links": { "instagram": "https://instagram.com/canvaslaughclub" }
  },
  {
    "id": "del-136",
    "name": "Akshara Theatre",
    "organization": "Independent",
    "category": "Comedy",
    "description": "Intimate; Central Delhi spot for open mics and storytellers. Tel: 9999691537.",
    "location": "Central Delhi",
    "links": { "instagram": "https://instagram.com/aksharatheatredelhi" }
  },
  {
    "id": "del-137",
    "name": "Happy High",
    "organization": "Independent",
    "category": "Comedy",
    "description": "Artsy; Experimental venue in Shahpur Jat; laid-back vibe. Tel: 9953964667.",
    "location": "Shahpur Jat, Delhi",
    "links": { "instagram": "https://instagram.com/happyhighind" }
  },

  // 19. Electronics - Collegiate
  {
    "id": "del-138",
    "name": "Electroholics",
    "organization": "IIIT Delhi",
    "category": "Electronics",
    "description": "DIY maker culture; open knowledge hardware enthusiasts.",
    "location": "Delhi",
    "links": { "website": "https://studentcouncil.iiitd.edu.in" }
  },
  {
    "id": "del-139",
    "name": "EES",
    "organization": "IIT Delhi",
    "category": "Electronics",
    "description": "Electrical Engineering Society; networking and tech interaction.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in" }
  },
  {
    "id": "del-140",
    "name": "Control Delvers",
    "organization": "NSUT",
    "category": "Electronics",
    "description": "Technical society for control systems and industrial automation.",
    "location": "Delhi",
    "links": { "website": "https://nsut.ac.in" }
  },
  // 19. Electronics - Non-Collegiate
  {
    "id": "del-141",
    "name": "APTRON",
    "organization": "Independent",
    "category": "Electronics",
    "description": "Skilled Training; Industrial projects and embedded C courses.",
    "location": "Delhi",
    "links": { "website": "https://aptronindia.com" }
  },
  {
    "id": "del-142",
    "name": "ThinkRobotics",
    "organization": "Independent",
    "category": "Electronics",
    "description": "Parts Supply; Electronic parts and hardware consultancy.",
    "location": "Delhi",
    "links": { "website": "https://thinkrobotics.in" }
  },
  {
    "id": "del-143",
    "name": "Devam Electrical",
    "organization": "Independent",
    "category": "Electronics",
    "description": "Scientific; Industrial scientific supply and training.",
    "location": "Delhi",
    "links": { "website": "https://devamelectrical.com" }
  },

  // 20. Robotics - Collegiate
  {
    "id": "del-144",
    "name": "Robotics Club",
    "organization": "IIT Delhi",
    "category": "Robotics",
    "description": "Automation and high-stakes technical research.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in" }
  },
  {
    "id": "del-145",
    "name": "SR-DTU",
    "organization": "DTU",
    "category": "Robotics",
    "description": "Society of Robotics; research and Robocon focus.",
    "location": "Delhi",
    "links": { "website": "https://srdtu.in" }
  },
  {
    "id": "del-146",
    "name": "Cyborg",
    "organization": "IIIT Delhi",
    "category": "Robotics",
    "description": "Mechatronic hardware and software solutions.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/cyborg_iiitd" }
  },
  // 20. Robotics - Non-Collegiate
  {
    "id": "del-147",
    "name": "Robospecies",
    "organization": "Independent",
    "category": "Robotics",
    "description": "Innovation Hub; Atal Tinkering Lab partner; transformer classrooms to hubs.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/robospecies", "website": "https://robospecies.com" }
  },
  {
    "id": "del-148",
    "name": "Skubotics",
    "organization": "Independent",
    "category": "Robotics",
    "description": "Workshop; Professional robotics training; rating 4.7.",
    "location": "Delhi",
    "links": { "website": "https://skubotics.com" }
  },
  {
    "id": "del-149",
    "name": "Nano Robotics",
    "organization": "Independent",
    "category": "Robotics",
    "description": "Embed Tech; Stem education and real-world industrial projects. Rating: 4.3.",
    "location": "NCR Wide",
    "links": { "website": "https://nanorobotics.com" }
  },

  // 21. Cultural - Collegiate
  {
    "id": "del-150",
    "name": "SPIC MACAY",
    "organization": "Multi-Chapter",
    "category": "Cultural",
    "description": "Promoting classical music; active in all major DU/IIT fests.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/spicmacay", "website": "https://spicmacay.com" }
  },
  {
    "id": "del-151",
    "name": "Cultural Club",
    "organization": "DTU",
    "category": "Cultural",
    "description": "Manages mega fests like 'Moksha' and 'Resonanz'.",
    "location": "Delhi",
    "links": { "website": "https://dtu.ac.in" }
  },
  {
    "id": "del-152",
    "name": "Vismaad",
    "organization": "GGSCC",
    "category": "Cultural",
    "description": "Divinity society; organizes shukrana samagam.",
    "location": "Delhi",
    "links": { "website": "https://sggscc.ac.in" }
  },
  // 21. Cultural - Non-Collegiate
  {
    "id": "del-153",
    "name": "IGNCA",
    "organization": "Independent",
    "category": "Cultural",
    "description": "National Heritage; Indira Gandhi National Centre for the Arts; research hub.",
    "location": "Delhi",
    "links": { "website": "https://ignca.gov.in" }
  },
  {
    "id": "del-154",
    "name": "Misfits",
    "organization": "Independent",
    "category": "Cultural",
    "description": "Community Club; 40+ hobby clubs; 120k+ members.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/_misfits_official", "website": "https://misfits.net.in" }
  },
  {
    "id": "del-155",
    "name": "Step Out",
    "organization": "Independent",
    "category": "Cultural",
    "description": "Dinner Club; Curates intimate dinners with 6 strangers.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/stepout_world" }
  },

  // 22. Business - Collegiate
  {
    "id": "del-156",
    "name": "E-Cell NSUT",
    "organization": "NSUT",
    "category": "Business",
    "description": "NSUT Entrepreneurship Cell; incubation and ideathon models.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/ecell_nsut" }
  },
  {
    "id": "del-157",
    "name": "BnC",
    "organization": "IIT Delhi",
    "category": "Business",
    "description": "Business and Consulting Club; case studies and strategy.",
    "location": "Delhi",
    "links": { "website": "https://caic.iitd.ac.in" }
  },
  {
    "id": "del-158",
    "name": "FIC",
    "organization": "SRCC",
    "category": "Business",
    "description": "Finance and Investment Cell; high-stakes case battles.",
    "location": "Delhi",
    "links": { "website": "https://srcc.edu" }
  },
  {
    "id": "del-159",
    "name": "Finnexia",
    "organization": "IIIT Delhi",
    "category": "Business",
    "description": "Finance club fostering campus financial literacy.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/finnexia_iiitd" }
  },
  {
    "id": "del-160",
    "name": "180DC SSCBS",
    "organization": "SSCBS",
    "category": "Business",
    "description": "SSCBS Global Best Strategy Project Award winner.",
    "location": "Delhi",
    "links": { "website": "mailto:cbs@180dc.org" }
  },
  // 22. Business - Non-Collegiate
  {
    "id": "del-161",
    "name": "Sahayak Club",
    "organization": "Independent",
    "category": "Business",
    "description": "Business Net; Started with 10 members; vision to reach 500 by 2026. Tel: 8506996650.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/sahayak_business_club" }
  },
  {
    "id": "del-162",
    "name": "Delhi Angel Net",
    "organization": "Independent",
    "category": "Business",
    "description": "Angel Group; Supporting high-potential tech startups with funding.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/delhiangelnetwork", "website": "https://delhiangelnetwork.in" }
  },
  {
    "id": "del-163",
    "name": "Startup Grind",
    "organization": "Independent",
    "category": "Business",
    "description": "Global Comm; Founders and investors; regular networking events.",
    "location": "Delhi",
    "links": { "instagram": "https://instagram.com/startupgrinddelhi", "website": "https://startupgrind.com/delhi" }
  },
  {
    "id": "del-164",
    "name": "HEN India",
    "organization": "Independent",
    "category": "Business",
    "description": "Women Net.; Her Entrepreneurial Network; weekly learning sessions.",
    "location": "Delhi",
    "links": { "website": "https://henindia.com", "website": "mailto:henindia@gmail.com" }
  }
];

const globalPath = '/Users/vaibhavreddy/Demo/easy-club-app/data/global-directory.json';
const globalData = JSON.parse(fs.readFileSync(globalPath, 'utf8'));

// Filter out all current del- entries
const filteredData = globalData.filter(item => !item.id.startsWith('del-'));

// Re-index Mumbai and Bangalore entries if they follow del- entries (optional, but keep it clean)
// But I'll just append them after global entries for now.
// Actually, let's find the position after g- entries.

const gEntries = filteredData.filter(item => item.id.startsWith('g-'));
const otherEntries = filteredData.filter(item => !item.id.startsWith('g-'));

const finalData = [...gEntries, ...data, ...otherEntries];

fs.writeFileSync(globalPath, JSON.stringify(finalData, null, 2));
console.log(`Successfully imported ${data.length} clubs from PDF.`);

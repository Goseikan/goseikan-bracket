import { User, Dojo, Team, Tournament, Court, KendoRank } from "../types";

/**
 * Sample data generator based on 2024 Michigan Cup tournament
 * Creates realistic tournament data with proper dojo/team structure
 */

// Sample data extracted from the tournament program
const SAMPLE_DOJOS_DATA = [
  {
    name: "Bloomington Normal Kendo Club",
    abbreviation: "BNKC",
    participants: [{ name: "Joshua Rhodes", rank: "4 Dan" as KendoRank }],
  },
  {
    name: "Cleveland Kendo Association",
    abbreviation: "CKA",
    participants: [
      { name: "John Beaty", rank: "5 Dan" as KendoRank },
      { name: "Yudai Yamamoto", rank: "4 Dan" as KendoRank },
      { name: "Peter Lopez", rank: "3 Dan" as KendoRank },
      { name: "Philip Hughes", rank: "1 Dan" as KendoRank },
      { name: "Patrick Leary", rank: "1 Kyu" as KendoRank },
      { name: "Atlas Renwick-Cusma", rank: "5 Kyu" as KendoRank },
      { name: "Yifu Chen", rank: "Mudansha" as KendoRank },
      { name: "Allison Chatlos", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Columbus Kendo Club",
    abbreviation: "CKC",
    participants: [
      { name: "Hinata Suwa", rank: "1 Dan" as KendoRank },
      { name: "Ayumu Suwa", rank: "1 Dan" as KendoRank },
      { name: "Katie Maynard", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Costa Mesa Kendo Dojo",
    abbreviation: "CMKD",
    participants: [{ name: "Vishwaas Gangeddula", rank: "1 Dan" as KendoRank }],
  },
  {
    name: "Detroit Kendo Dojo",
    abbreviation: "DKD",
    participants: [
      { name: "Hirotaka Yoshikawa", rank: "6 Dan" as KendoRank },
      { name: "Sayaka Minami", rank: "2 Dan" as KendoRank },
      { name: "Akihito Ohta", rank: "2 Dan" as KendoRank },
      { name: "Kotaro Kurita", rank: "2 Dan" as KendoRank },
      { name: "Jensen Masato Dahl", rank: "2 Dan" as KendoRank },
      { name: "Hinako Naritomi", rank: "1 Kyu" as KendoRank },
      { name: "Ryosei Yamada", rank: "1 Kyu" as KendoRank },
      { name: "Hyogo Naritomi", rank: "2 Kyu" as KendoRank },
      { name: "Shiho Kurita", rank: "2 Kyu" as KendoRank },
      { name: "Yu Fukuhara", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Goseikan",
    abbreviation: "GSK",
    participants: [
      { name: "Gordan Small", rank: "6 Dan" as KendoRank },
      { name: "Daniel Ahn", rank: "4 Dan" as KendoRank },
      { name: "Naoya Isobe", rank: "4 Dan" as KendoRank },
      { name: "Hemil Gonzalez", rank: "3 Dan" as KendoRank },
      { name: "John Lee", rank: "1 Dan" as KendoRank },
      { name: "Joe Lee", rank: "1 Dan" as KendoRank },
      { name: "Bryson Rawlings", rank: "2 Kyu" as KendoRank },
      { name: "Tyler Chen", rank: "3 Kyu" as KendoRank },
      { name: "Jordan N. Newell", rank: "3 Kyu" as KendoRank },
      { name: "Edward Soderberg", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Great Lakes Kendo Dojo",
    abbreviation: "GLKD",
    participants: [
      { name: "Robin Tanaka", rank: "7 Dan" as KendoRank },
      { name: "Takuya Manome", rank: "6 Dan" as KendoRank },
      { name: "Keiichiro Tsuji", rank: "5 Dan" as KendoRank },
      { name: "Phillip Karpowicz", rank: "4 Dan" as KendoRank },
      { name: "Emily Shinohara", rank: "3 Dan" as KendoRank },
      { name: "Hideo Imai", rank: "3 Dan" as KendoRank },
      { name: "Maki Mitsuya", rank: "3 Dan" as KendoRank },
      { name: "Brandon Shinnosuke Christ", rank: "1 Dan" as KendoRank },
      { name: "Kotaro Tanaka", rank: "1 Kyu" as KendoRank },
      { name: "Jonah Nguyen", rank: "2 Kyu" as KendoRank },
      { name: "Shuntaro Tanaka", rank: "2 Kyu" as KendoRank },
      { name: "Peyton Allard", rank: "2 Kyu" as KendoRank },
      { name: "Niko Tsuji", rank: "2 Kyu" as KendoRank },
      { name: "Liam Gilliland", rank: "3 Kyu" as KendoRank },
      { name: "Milo Gilliland", rank: "6 Kyu" as KendoRank },
      { name: "Takumi Manome", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Hampton Roads Kendo Dojo",
    abbreviation: "HRKD",
    participants: [{ name: "Yong Back", rank: "4 Dan" as KendoRank }],
  },
  {
    name: "JCCC Kendo Club",
    abbreviation: "JCCC",
    participants: [{ name: "Ryo Tamaru", rank: "6 Dan" as KendoRank }],
  },
  {
    name: "Koyokai",
    abbreviation: "KYK",
    participants: [
      { name: "Yutaro Matsuura", rank: "7 Dan" as KendoRank },
      { name: "Vlad Trusevich", rank: "4 Dan" as KendoRank },
      { name: "Amy Walker", rank: "3 Dan" as KendoRank },
      { name: "Sean Kelly", rank: "3 Dan" as KendoRank },
      { name: "Steve Walker", rank: "3 Dan" as KendoRank },
      { name: "Josh Elmblad", rank: "3 Dan" as KendoRank },
      { name: "Eric Collins", rank: "3 Dan" as KendoRank },
      { name: "Christopher Choi", rank: "2 Dan" as KendoRank },
      { name: "Taichi Matsuura", rank: "1 Dan" as KendoRank },
      { name: "Anton Trusevich", rank: "1 Kyu" as KendoRank },
      { name: "Matt MacLaren", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Macomb Kendo Dojo",
    abbreviation: "MKD",
    participants: [
      { name: "Travis Hill", rank: "6 Dan" as KendoRank },
      { name: "Mimi Hill", rank: "5 Dan" as KendoRank },
      { name: "Tim Minowa", rank: "5 Dan" as KendoRank },
      { name: "Daichi Sakuma", rank: "4 Dan" as KendoRank },
      { name: "Ryan Choi", rank: "3 Dan" as KendoRank },
      { name: "Kouta Horiguchi", rank: "2 Dan" as KendoRank },
      { name: "Kiki Choi", rank: "2 Dan" as KendoRank },
      { name: "Sarah Chung", rank: "2 Dan" as KendoRank },
      { name: "Michael Krueger", rank: "Mudansha" as KendoRank },
      { name: "Shane Dasine", rank: "Mudansha" as KendoRank },
      { name: "Yung Jen Cheng", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Miami Valley Kendo Club",
    abbreviation: "MVKC",
    participants: [
      { name: "Christopher Robert Glyptis", rank: "3 Kyu" as KendoRank },
    ],
  },
  {
    name: "Milwaukee Kendo Club",
    abbreviation: "MKC",
    participants: [
      { name: "Erik Hancock", rank: "3 Dan" as KendoRank },
      { name: "Anwar Jackson", rank: "1 Dan" as KendoRank },
    ],
  },
  {
    name: "Minnehaha Kendo Dojo",
    abbreviation: "MHD",
    participants: [
      { name: "Travis Stronach", rank: "6 Dan" as KendoRank },
      { name: "Xue Lin", rank: "2 Dan" as KendoRank },
    ],
  },
  {
    name: "Michigan State University Kendo Club",
    abbreviation: "MSU",
    participants: [
      { name: "Takuma Miura", rank: "5 Dan" as KendoRank },
      { name: "PJ Smaza", rank: "Mudansha" as KendoRank },
      { name: "Justyce Yin", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Ohio State University Kendo Club",
    abbreviation: "OSU",
    participants: [
      { name: "Maya Perlmutter", rank: "2 Dan" as KendoRank },
      { name: "Bakusa Conteh", rank: "1 Dan" as KendoRank },
      { name: "Nathan Henderson", rank: "Mudansha" as KendoRank },
      { name: "Nicholas Sansoterra", rank: "Mudansha" as KendoRank },
      { name: "Derek Chen", rank: "Mudansha" as KendoRank },
    ],
  },
  {
    name: "Pittsburgh Kenyukai",
    abbreviation: "PK",
    participants: [
      { name: "Taejin Jeong", rank: "4 Dan" as KendoRank },
      { name: "Yuqing Chen", rank: "2 Dan" as KendoRank },
      { name: "Dong Yu", rank: "1 Dan" as KendoRank },
    ],
  },
  {
    name: "St. Louis Kendo",
    abbreviation: "STL",
    participants: [
      { name: "Mark Chao", rank: "4 Dan" as KendoRank },
      { name: "Efrem Taiga Nickel", rank: "3 Dan" as KendoRank },
      { name: "Linjie Bu", rank: "2 Dan" as KendoRank },
      { name: "Zhizhen Zhou", rank: "2 Dan" as KendoRank },
      { name: "Brandon Terrizzi", rank: "2 Dan" as KendoRank },
      { name: "Kouki Saathoff", rank: "2 Dan" as KendoRank },
    ],
  },
  {
    name: "Seishinkan",
    abbreviation: "SEI",
    participants: [
      { name: "Noriyuki Sakuma", rank: "6 Dan" as KendoRank },
      { name: "Jason Aubry", rank: "4 Dan" as KendoRank },
      { name: "Charlie Kondek", rank: "4 Dan" as KendoRank },
      { name: "Jason Engling", rank: "3 Dan" as KendoRank },
      { name: "Satoshi Horiguchi", rank: "2 Dan" as KendoRank },
      { name: "Sladjan Stojkovic", rank: "2 Dan" as KendoRank },
      { name: "Lingling Peng", rank: "1 Dan" as KendoRank },
      { name: "Alexander J Maynard", rank: "2 Kyu" as KendoRank },
    ],
  },
  {
    name: "Toronto Kendo Club",
    abbreviation: "TKC",
    participants: [
      { name: "Koichi Miyamoto", rank: "7 Dan" as KendoRank },
      { name: "Qidong Wang", rank: "3 Dan" as KendoRank },
      { name: "Taketoshi Miyamoto", rank: "2 Dan" as KendoRank },
      { name: "Yona Kushima", rank: "2 Dan" as KendoRank },
    ],
  },
  {
    name: "University of Michigan Kendo Club",
    abbreviation: "UM",
    participants: [
      { name: "Joseph Ponchart", rank: "4 Dan" as KendoRank },
      { name: "Archie Geng", rank: "3 Dan" as KendoRank },
      { name: "Raymond Wen", rank: "3 Dan" as KendoRank },
      { name: "Nathan Choi", rank: "3 Dan" as KendoRank },
      { name: "Chris Lee", rank: "Mudansha" as KendoRank },
    ],
  },
];

/**
 * Generate sample teams for each dojo
 * Creates 2-3 teams per dojo with 7 players each where possible
 */
const generateTeamsForDojo = (
  dojoData: (typeof SAMPLE_DOJOS_DATA)[0],
  dojoId: string
): Team[] => {
  const teams: Team[] = [];
  const participants = dojoData.participants;

  // Calculate number of teams needed (aim for 5-7 players per team)
  const teamCount = Math.max(1, Math.ceil(participants.length / 7));

  for (let i = 0; i < teamCount; i++) {
    const teamName =
      teamCount === 1
        ? `${dojoData.name} Main Team`
        : `${dojoData.name} Team ${String.fromCharCode(65 + i)}`; // A, B, C, etc.

    const startIndex = i * 7;
    const endIndex = Math.min(startIndex + 7, participants.length);
    const teamParticipants = participants.slice(startIndex, endIndex);

    // Generate team logo with different color
    const teamColor = TEAM_LOGO_COLORS[i % TEAM_LOGO_COLORS.length];
    const teamAbbrev =
      teamCount === 1
        ? dojoData.abbreviation
        : `${dojoData.abbreviation}${String.fromCharCode(65 + i)}`;
    const teamLogo = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${teamColor}'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='12' font-weight='bold' text-anchor='middle' fill='white'%3E${teamAbbrev}%3C/text%3E%3C/svg%3E`;

    teams.push({
      id: `team_${dojoId}_${i + 1}`,
      name: teamName,
      dojoId,
      logo: teamLogo, // Add team logo
      players: [], // Will be populated in assignUsersToTeams
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return teams;
};

/**
 * Generate sample users from tournament data
 */
const generateUsers = (): User[] => {
  const users: User[] = [];

  // Add super admin user
  users.push({
    id: "super_admin_1",
    fullName: "Super Administrator",
    email: "superadmin@tournament.com",
    password: "superadmin123", // In real app, this would be hashed
    dateOfBirth: "1980-01-01",
    dojoId: "dojo_goseikan",
    teamId: "team_dojo_goseikan_1",
    role: "super_admin",
    kendoRank: "7 Dan",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Add admin user
  users.push({
    id: "admin_1",
    fullName: "Tournament Administrator",
    email: "admin@tournament.com",
    password: "admin123", // In real app, this would be hashed
    dateOfBirth: "1985-01-01",
    dojoId: "dojo_macomb_kendo_dojo",
    teamId: "team_dojo_macomb_kendo_dojo_1",
    role: "admin",
    kendoRank: "6 Dan",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Generate users from sample data
  SAMPLE_DOJOS_DATA.forEach((dojoData, dojoIndex) => {
    const dojoId = `dojo_${dojoData.name.toLowerCase().replace(/\s+/g, "_")}`;

    dojoData.participants.forEach((participant, participantIndex) => {
      const userId = `user_${participant.name
        .replace(/\s+/g, "_")
        .toLowerCase()}`;

      // Generate realistic birth dates based on rank
      let birthYear = 1990;
      if (participant.rank.includes("Dan")) {
        const danLevel = parseInt(participant.rank.charAt(0));
        birthYear = 1980 - danLevel * 2; // Higher dans are typically older
      } else if (participant.rank.includes("Kyu")) {
        birthYear = 1995 + Math.floor(Math.random() * 10); // Kyu ranks are typically younger
      } else {
        birthYear = 2000 + Math.floor(Math.random() * 5); // Mudansha are typically youngest
      }

      const email = `${participant.name
        .toLowerCase()
        .replace(/\s+/g, ".")}@${dojoData.abbreviation.toLowerCase()}.com`;

      users.push({
        id: userId,
        fullName: participant.name,
        email,
        password: "password123", // In real app, this would be hashed
        dateOfBirth: `${birthYear}-${String(
          Math.floor(Math.random() * 12) + 1
        ).padStart(2, "0")}-${String(
          Math.floor(Math.random() * 28) + 1
        ).padStart(2, "0")}`,
        dojoId,
        teamId: "", // Will be assigned when teams are created
        role: "participant",
        kendoRank: participant.rank,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  });

  return users;
};

// Sample logo placeholders with unique colors and abbreviations for all dojos
const DOJO_LOGOS: Record<string, string> = {
  "Bloomington Normal Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%234F46E5'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle' fill='white'%3EBNKC%3C/text%3E%3C/svg%3E",
  "Cleveland Kendo Association":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23DC2626'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3ECKA%3C/text%3E%3C/svg%3E",
  "Columbus Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23059669'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3ECKC%3C/text%3E%3C/svg%3E",
  "Costa Mesa Kendo Dojo":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23F59E0B'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle' fill='white'%3ECMKD%3C/text%3E%3C/svg%3E",
  "Detroit Kendo Dojo":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23059669'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EDKD%3C/text%3E%3C/svg%3E",
  Goseikan:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23B91C1C'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EGSK%3C/text%3E%3C/svg%3E",
  "Great Lakes Kendo Dojo":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%231D4ED8'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' font-weight='bold' text-anchor='middle' fill='white'%3EGLKD%3C/text%3E%3C/svg%3E",
  "Hampton Roads Kendo Dojo":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23C026D3'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle' fill='white'%3EHRKD%3C/text%3E%3C/svg%3E",
  "JCCC Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2314B8A6'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EJCCC%3C/text%3E%3C/svg%3E",
  Koyokai:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23EF4444'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EKYOK%3C/text%3E%3C/svg%3E",
  "Macomb Kendo Dojo":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%236B7280'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EMKD%3C/text%3E%3C/svg%3E",
  "Miami Valley Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23F97316'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle' fill='white'%3EMVKC%3C/text%3E%3C/svg%3E",
  "Milwaukee Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2384CC16'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EMKC%3C/text%3E%3C/svg%3E",
  "Minnehaha Kendo Dojo":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%238B5CF6'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='14' font-weight='bold' text-anchor='middle' fill='white'%3EMHKD%3C/text%3E%3C/svg%3E",
  "Michigan State University Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2306B6D4'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EMSU%3C/text%3E%3C/svg%3E",
  "Ohio State University Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23DC2626'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EOSU%3C/text%3E%3C/svg%3E",
  "Pittsburgh Kenyukai":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FBBF24'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3EPITT%3C/text%3E%3C/svg%3E",
  "St. Louis Kendo":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%233B82F6'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3ESTL%3C/text%3E%3C/svg%3E",
  Seishinkan:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%2310B981'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3ESEI%3C/text%3E%3C/svg%3E",
  "Toronto Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23BE185D'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='16' font-weight='bold' text-anchor='middle' fill='white'%3ETKC%3C/text%3E%3C/svg%3E",
  "University of Michigan Kendo Club":
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23FBBF24'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='18' font-weight='bold' text-anchor='middle' fill='blue'%3EUM%3C/text%3E%3C/svg%3E",
};

/**
 * Generate sample dojos
 */
const generateDojos = (): Dojo[] => {
  return SAMPLE_DOJOS_DATA.map((dojoData, index) => ({
    id: `dojo_${dojoData.name.toLowerCase().replace(/\s+/g, "_")}`,
    name: dojoData.name,
    location: `${dojoData.name.split(" ")[0]}, USA`, // Approximate location
    logo: DOJO_LOGOS[dojoData.name], // Add logo
    teams: [], // Will be populated later
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
};

// Sample team logo colors (each team gets a different colored version) - Expanded palette
const TEAM_LOGO_COLORS = [
  "%23EF4444", // Red
  "%23F59E0B", // Amber
  "%2310B981", // Emerald
  "%233B82F6", // Blue
  "%236366F1", // Indigo
  "%238B5CF6", // Violet
  "%23EC4899", // Pink
  "%2306B6D4", // Cyan
  "%2384CC16", // Lime
  "%23F97316", // Orange
  "%23DC2626", // Red-600
  "%231D4ED8", // Blue-700
  "%23059669", // Green-600
  "%23C026D3", // Fuchsia-600
  "%2314B8A6", // Teal-500
  "%236B7280", // Gray-500
];

/**
 * Generate sample teams
 */
const generateTeams = (dojos: Dojo[]): Team[] => {
  const allTeams: Team[] = [];

  dojos.forEach((dojo) => {
    const dojoData = SAMPLE_DOJOS_DATA.find((d) => d.name === dojo.name);
    if (dojoData) {
      const teams = generateTeamsForDojo(dojoData, dojo.id);
      allTeams.push(...teams);
    }
  });

  return allTeams;
};

/**
 * Generate sample courts
 */
const generateCourts = (): Court[] => {
  return [
    {
      id: "court_a",
      name: "Court A",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "court_b",
      name: "Court B",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "court_c",
      name: "Court C",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "court_d",
      name: "Court D",
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
};

/**
 * Generate sample tournament
 */
const generateTournament = (): Tournament => {
  return {
    id: "tournament_2024_michigan_cup",
    name: "2025 Goryuki in Chicago",
    description:
      "Annual kendo tournament in Chicago featuring a seeded team competition",
    status: "registration",
    isActive: true,
    maxParticipants: 200,
    seedGroups: [],
    mainBracket: {
      id: "main_bracket",
      type: "double_elimination",
      rounds: [],
    },
    courts: [
      {
        id: "court_a",
        name: "Court A",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "court_b",
        name: "Court B",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "court_c",
        name: "Court C",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "court_d",
        name: "Court D",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Assign users to teams and update team player lists
 */
const assignUsersToTeams = (
  users: User[],
  teams: Team[]
): { users: User[]; teams: Team[] } => {
  const updatedUsers = [...users];
  const updatedTeams = [...teams];

  // Assign each user to the appropriate team
  updatedUsers.forEach((user) => {
    if (user.role === "admin" || user.role === "super_admin") return; // Skip admin users

    // Find the first team for this user's dojo that has space (max 7 members)
    let userTeam = updatedTeams.find((team) => {
      if (team.dojoId !== user.dojoId) return false;

      // Count users already assigned to this team
      const assignedUserCount = updatedUsers.filter(
        (u) => u.teamId === team.id
      ).length;
      return assignedUserCount < 7;
    });

    // If no team has space, create a new team for this dojo
    if (!userTeam) {
      const dojoId = user.dojoId;
      const dojo = SAMPLE_DOJOS_DATA.find(
        (d) => `dojo_${d.name.toLowerCase().replace(/\s+/g, "_")}` === dojoId
      );
      if (dojo) {
        const existingTeamsForDojo = updatedTeams.filter(
          (t) => t.dojoId === user.dojoId
        );
        const teamIndex = existingTeamsForDojo.length;
        const teamName = `${dojo.name} Team ${String.fromCharCode(
          65 + teamIndex
        )}`; // A, B, C, etc.

        // Generate team logo with different color
        const teamColor = TEAM_LOGO_COLORS[teamIndex % TEAM_LOGO_COLORS.length];
        const teamAbbrev = `${dojo.abbreviation}${String.fromCharCode(
          65 + teamIndex
        )}`;
        const teamLogo = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='${teamColor}'/%3E%3Ctext x='50' y='55' font-family='Arial' font-size='12' font-weight='bold' text-anchor='middle' fill='white'%3E${teamAbbrev}%3C/text%3E%3C/svg%3E`;

        userTeam = {
          id: `team_${user.dojoId}_${teamIndex + 1}`,
          name: teamName,
          dojoId: user.dojoId,
          logo: teamLogo,
          players: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        updatedTeams.push(userTeam);
      }
    }

    if (userTeam) {
      user.teamId = userTeam.id;
      // Note: team.players array will be populated by TournamentContext
      // based on user teamId assignments to ensure consistency
    }
  });

  return { users: updatedUsers, teams: updatedTeams };
};

/**
 * Generate all sample data for the tournament
 */
export const generateSampleTournamentData = () => {
  const dojos = generateDojos();
  const teams = generateTeams(dojos);
  const users = generateUsers();
  const courts = generateCourts();
  const tournament = generateTournament();

  // Assign users to teams
  const { users: assignedUsers, teams: updatedTeams } = assignUsersToTeams(
    users,
    teams
  );

  return {
    dojos,
    teams: updatedTeams,
    users: assignedUsers,
    courts,
    tournaments: [tournament],
    matches: [],
  };
};

/**
 * Initialize sample data in localStorage
 */
export const initializeSampleData = (): void => {
  // Only initialize if no data exists
  if (!localStorage.getItem("users")) {
    const sampleData = generateSampleTournamentData();

    localStorage.setItem("users", JSON.stringify(sampleData.users));
    localStorage.setItem("dojos", JSON.stringify(sampleData.dojos));
    localStorage.setItem("teams", JSON.stringify(sampleData.teams));
    localStorage.setItem("courts", JSON.stringify(sampleData.courts));
    localStorage.setItem("tournaments", JSON.stringify(sampleData.tournaments));
    localStorage.setItem("matches", JSON.stringify(sampleData.matches));

    console.log("Sample tournament data initialized:", {
      users: sampleData.users.length,
      dojos: sampleData.dojos.length,
      teams: sampleData.teams.length,
      courts: sampleData.courts.length,
    });
  }
};

/**
 * Reset and reinitialize sample data with logos
 * Call this to update existing data with new logo fields
 */
export const resetSampleDataWithLogos = (): void => {
  // Clear existing data
  localStorage.removeItem("users");
  localStorage.removeItem("dojos");
  localStorage.removeItem("teams");
  localStorage.removeItem("courts");
  localStorage.removeItem("tournaments");
  localStorage.removeItem("matches");

  // Reinitialize with logos
  initializeSampleData();
  console.log("Sample data reset with logos");
};

/**
 * Force reset all sample data - useful for debugging
 * Call this to completely regenerate all data with latest logic
 */
export const forceResetSampleData = (): void => {
  // Clear existing data
  localStorage.removeItem("users");
  localStorage.removeItem("dojos");
  localStorage.removeItem("teams");
  localStorage.removeItem("courts");
  localStorage.removeItem("tournaments");
  localStorage.removeItem("matches");

  // Reinitialize with latest logic
  initializeSampleData();
  console.log(
    "Sample data force reset - all data regenerated with latest logic"
  );
};

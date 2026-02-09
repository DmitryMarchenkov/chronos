import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { load } from 'cheerio';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOURCE_URL = 'https://en.wikipedia.org/wiki/List_of_largest_companies_by_revenue';
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'real-clients.json');
const MAX_ROWS = Number.parseInt(process.env.MAX_ROWS ?? '', 10);
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'owner@chronos.local';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? 'password123';

type CompanyRow = {
  rank: number;
  name: string;
  industry: string | null;
  revenueUsdMillions: number | null;
  headquarters: string | null;
  country: string | null;
};

const parseNumber = (value: string): number | null => {
  const cleaned = value.replace(/[%$,]/g, '').trim();
  if (!cleaned || cleaned === 'N.A.' || cleaned === '-' || cleaned === '—') {
    return null;
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const stripCitations = (value: string) => value.replace(/\[\d+]/g, '').trim();

const normalizeHeader = (value: string) =>
  stripCitations(value).toLowerCase().replace(/\s+/g, ' ').trim();

const pickHeaderIndex = (headers: string[], patterns: RegExp[]) =>
  headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));

const fetchHtml = async (): Promise<string> => {
  const response = await fetch(SOURCE_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${SOURCE_URL}: ${response.status} ${response.statusText}`);
  }
  return response.text();
};

const parseTable = (html: string, maxRows: number | null): CompanyRow[] => {
  const $ = load(html);
  let selectedTable = $();

  $('table').each((_, table) => {
    const tableNode = $(table);
    const headerCells = tableNode.find('tr').first().find('th');
    const headerText = normalizeHeader(headerCells.text());
    const bodyRows = tableNode.find('tbody tr');

    if (
      bodyRows.length &&
      headerText.includes('revenue') &&
      (headerText.includes('company') || headerText.includes('name'))
    ) {
      selectedTable = tableNode;
      return false;
    }
    return undefined;
  });

  if (!selectedTable.length) {
    throw new Error('Could not find company revenue table on the source page.');
  }

  const headerCells = selectedTable.find('tr').first().find('th');
  const headers = headerCells
    .map((_, cell) => normalizeHeader($(cell).text()))
    .get();

  const rankIndex = pickHeaderIndex(headers, [/rank/]);
  const nameIndex = pickHeaderIndex(headers, [/company/, /name/]);
  const industryIndex = pickHeaderIndex(headers, [/industry/]);
  const revenueIndex = pickHeaderIndex(headers, [/revenue/]);
  const headquartersIndex = pickHeaderIndex(headers, [/headquarters/, /hq/]);

  if (nameIndex === -1 || revenueIndex === -1) {
    throw new Error('Company or revenue columns are missing from the source table.');
  }

  const parsedRows = selectedTable
    .find('tbody tr')
    .map((_, row) => {
      const cells = $(row).find('th,td');
      if (cells.length === 0 || nameIndex < 0 || revenueIndex < 0) {
        return null;
      }

      const rank = rankIndex >= 0 ? parseNumber($(cells[rankIndex]).text()) ?? 0 : 0;
      const name = stripCitations($(cells[nameIndex]).text());
      const industry =
        industryIndex >= 0 ? stripCitations($(cells[industryIndex]).text()) : null;
      const revenueUsdMillions =
        revenueIndex >= 0 ? parseNumber($(cells[revenueIndex]).text()) : null;
      const headquarters =
        headquartersIndex >= 0 ? stripCitations($(cells[headquartersIndex]).text()) : null;
      const country = headquarters
        ? headquarters.split(',').slice(-1)[0]?.trim() ?? null
        : null;

      if (!name) {
        return null;
      }

      return {
        rank,
        name,
        industry: industry || null,
        revenueUsdMillions,
        headquarters: headquarters || null,
        country,
      } satisfies CompanyRow;
    })
    .get()
    .filter((row): row is CompanyRow => Boolean(row && row.name));

  if (maxRows !== null && parsedRows.length > maxRows) {
    return parsedRows.slice(0, maxRows);
  }

  return parsedRows;
};

const run = async () => {
  const html = await fetchHtml();
  const hasLimit = Number.isFinite(MAX_ROWS) && MAX_ROWS > 0;
  const rows = parseTable(html, hasLimit ? MAX_ROWS : null);

  const passwordHash = await argon2.hash(OWNER_PASSWORD);
  const owner = await prisma.user.upsert({
    where: { email: OWNER_EMAIL },
    update: {},
    create: {
      email: OWNER_EMAIL,
      passwordHash,
    },
  });

  for (const row of rows) {
    const clientId = `real-client-${row.rank || rows.indexOf(row) + 1}`;
    const name = row.name;

    const client = await prisma.client.upsert({
      where: { id: clientId },
      update: { name },
      create: {
        id: clientId,
        name,
      },
    });

    await prisma.workspaceMember.upsert({
      where: {
        userId_clientId: {
          userId: owner.id,
          clientId: client.id,
        },
      },
      update: { role: 'OWNER' },
      create: {
        userId: owner.id,
        clientId: client.id,
        role: 'OWNER',
      },
    });
  }

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });

  const payload = {
    source: SOURCE_URL,
    fetchedAt: new Date().toISOString(),
    rows,
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(payload, null, 2));
  const limitLabel = hasLimit ? ` (limit ${MAX_ROWS})` : '';
  console.log(`Saved ${rows.length} rows to ${OUTPUT_PATH}${limitLabel}`);
  console.log(`Upserted ${rows.length} clients for ${OWNER_EMAIL}`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

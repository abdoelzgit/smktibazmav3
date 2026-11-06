const { prisma } = require('./lib/prisma');

async function test() {
  const [pCount, pVerif, pPending, recentP, bCount, bPub, kCount, kPub] = await Promise.all([
    prisma.pendaftaran.count(),
    prisma.pendaftaran.count({ where: { status: { in: ['VERIFIED', 'ACCEPTED'] } } }),
    prisma.pendaftaran.count({ where: { status: { in: ['SUBMITTED', 'DRAFT'] } } }),
    prisma.pendaftaran.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        biodata: { select: { namaLengkap: true, nisn: true } },
        sekolahAsal: { select: { namaSekolahAsal: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.berita.count(),
    prisma.berita.count({ where: { published: true } }),
    prisma.jejakKarya.count(),
    prisma.jejakKarya.count({ where: { published: true } }),
  ]);
  console.log(JSON.stringify({ pCount, pVerif, pPending, recentCount: recentP.length, bCount, bPub, kCount, kPub }));
}

test()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });


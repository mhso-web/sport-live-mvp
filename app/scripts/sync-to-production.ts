import { PrismaClient } from '@prisma/client';

// Local database client
const localPrisma = new PrismaClient();

// Production database client
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.PROD_DATABASE_URL
    }
  }
});

async function syncData() {
  console.log('🚀 Starting data synchronization from local to production...\n');
  
  try {
    // 1. Sync Board Categories (if missing)
    console.log('📋 Syncing Board Categories...');
    const localCategories = await localPrisma.boardCategory.findMany();
    for (const category of localCategories) {
      const exists = await prodPrisma.boardCategory.findUnique({
        where: { slug: category.slug }
      });
      
      if (!exists) {
        await prodPrisma.boardCategory.create({
          data: {
            name: category.name,
            slug: category.slug,
            description: category.description,
            icon: category.icon,
            orderIndex: category.orderIndex,
            isActive: category.isActive,
            boardType: category.boardType
          }
        });
        console.log(`  ✅ Created category: ${category.name}`);
      }
    }
    
    // 2. Ensure we have an admin user for partner creation
    console.log('\n👤 Ensuring admin user exists...');
    let adminUser = await prodPrisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      // Get admin from local
      const localAdmin = await localPrisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      if (localAdmin) {
        adminUser = await prodPrisma.user.create({
          data: {
            email: localAdmin.email,
            username: localAdmin.username,
            password: localAdmin.password,
            role: localAdmin.role,
            level: localAdmin.level,
            experience: localAdmin.experience,
            isActive: localAdmin.isActive
          }
        });
        console.log(`  ✅ Created admin user: ${adminUser.username}`);
      }
    }
    
    // 3. Sync Partners
    console.log('\n🤝 Syncing Partners...');
    const localPartners = await localPrisma.partner.findMany({
      where: { isActive: true },
      include: { creator: true }
    });
    
    for (const partner of localPartners) {
      const exists = await prodPrisma.partner.findUnique({
        where: { name: partner.name }
      });
      
      if (!exists) {
        // Ensure creator user exists in production
        let creatorUser = await prodPrisma.user.findUnique({
          where: { email: partner.creator.email }
        });
        
        if (!creatorUser) {
          creatorUser = await prodPrisma.user.create({
            data: {
              email: partner.creator.email,
              username: partner.creator.username,
              password: partner.creator.password,
              role: partner.creator.role,
              level: partner.creator.level,
              experience: partner.creator.experience,
              isActive: partner.creator.isActive
            }
          });
        }
        
        await prodPrisma.partner.create({
          data: {
            name: partner.name,
            description: partner.description,
            detailContent: partner.detailContent,
            websiteUrl: partner.websiteUrl,
            bannerImage: partner.bannerImage,
            isActive: partner.isActive,
            viewCount: partner.viewCount,
            createdBy: creatorUser.id
          }
        });
        console.log(`  ✅ Created partner: ${partner.name}`);
      }
    }
    
    // 4. Sync Sports
    console.log('\n⚽ Syncing Sports...');
    const localSports = await localPrisma.sport.findMany();
    for (const sport of localSports) {
      const exists = await prodPrisma.sport.findUnique({
        where: { slug: sport.slug }
      });
      
      if (!exists) {
        await prodPrisma.sport.create({
          data: {
            nameEn: sport.nameEn,
            nameKo: sport.nameKo,
            slug: sport.slug,
            description: sport.description,
            icon: sport.icon,
            rules: sport.rules,
            metadata: sport.metadata,
            isActive: sport.isActive,
            orderIndex: sport.orderIndex
          }
        });
        console.log(`  ✅ Created sport: ${sport.nameKo}`);
      }
    }
    
    // 5. Sync Leagues
    console.log('\n🏆 Syncing Leagues...');
    const localLeagues = await localPrisma.league.findMany();
    for (const league of localLeagues) {
      const sport = await prodPrisma.sport.findUnique({
        where: { slug: (await localPrisma.sport.findUnique({ where: { id: league.sportId }}))!.slug }
      });
      
      if (sport) {
        const exists = await prodPrisma.league.findFirst({
          where: { 
            slug: league.slug,
            sportId: sport.id
          }
        });
        
        if (!exists) {
          await prodPrisma.league.create({
            data: {
              nameEn: league.nameEn,
              nameKo: league.nameKo,
              slug: league.slug,
              description: league.description,
              sportId: sport.id,
              country: league.country,
              logo: league.logo,
              seasons: league.seasons,
              metadata: league.metadata,
              isActive: league.isActive,
              orderIndex: league.orderIndex
            }
          });
          console.log(`  ✅ Created league: ${league.nameKo}`);
        }
      }
    }
    
    // 6. Sync Teams
    console.log('\n👥 Syncing Teams...');
    const localTeams = await localPrisma.team.findMany();
    for (const team of localTeams) {
      const sport = await prodPrisma.sport.findUnique({
        where: { slug: (await localPrisma.sport.findUnique({ where: { id: team.sportId }}))!.slug }
      });
      
      if (sport) {
        const exists = await prodPrisma.team.findFirst({
          where: { 
            slug: team.slug,
            sportId: sport.id
          }
        });
        
        if (!exists) {
          await prodPrisma.team.create({
            data: {
              nameEn: team.nameEn,
              nameKo: team.nameKo,
              slug: team.slug,
              description: team.description,
              sportId: sport.id,
              country: team.country,
              city: team.city,
              stadium: team.stadium,
              founded: team.founded,
              logo: team.logo,
              colors: team.colors,
              website: team.website,
              socialMedia: team.socialMedia,
              metadata: team.metadata,
              isActive: team.isActive
            }
          });
          console.log(`  ✅ Created team: ${team.nameKo}`);
        }
      }
    }
    
    // 7. Sync Matches
    console.log('\n📅 Syncing Matches...');
    const localMatches = await localPrisma.match.findMany({
      take: 30,
      orderBy: { scheduledTime: 'desc' }
    });
    
    for (const match of localMatches) {
      const sport = await prodPrisma.sport.findUnique({
        where: { slug: (await localPrisma.sport.findUnique({ where: { id: match.sportId }}))!.slug }
      });
      
      if (sport) {
        // Get league and teams in production
        let leagueId = null;
        if (match.leagueId) {
          const localLeague = await localPrisma.league.findUnique({ where: { id: match.leagueId }});
          if (localLeague) {
            const prodLeague = await prodPrisma.league.findFirst({
              where: { slug: localLeague.slug, sportId: sport.id }
            });
            leagueId = prodLeague?.id || null;
          }
        }
        
        let homeTeamId = null;
        if (match.homeTeamId) {
          const localTeam = await localPrisma.team.findUnique({ where: { id: match.homeTeamId }});
          if (localTeam) {
            const prodTeam = await prodPrisma.team.findFirst({
              where: { slug: localTeam.slug, sportId: sport.id }
            });
            homeTeamId = prodTeam?.id || null;
          }
        }
        
        let awayTeamId = null;
        if (match.awayTeamId) {
          const localTeam = await localPrisma.team.findUnique({ where: { id: match.awayTeamId }});
          if (localTeam) {
            const prodTeam = await prodPrisma.team.findFirst({
              where: { slug: localTeam.slug, sportId: sport.id }
            });
            awayTeamId = prodTeam?.id || null;
          }
        }
        
        const exists = await prodPrisma.match.findFirst({
          where: {
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            scheduledTime: match.scheduledTime
          }
        });
        
        if (!exists) {
          await prodPrisma.match.create({
            data: {
              sportType: match.sportType,
              league: match.league,
              competition: match.competition,
              homeTeam: match.homeTeam,
              awayTeam: match.awayTeam,
              homeTeamLogo: match.homeTeamLogo,
              awayTeamLogo: match.awayTeamLogo,
              scheduledTime: match.scheduledTime,
              status: match.status,
              homeScore: match.homeScore,
              awayScore: match.awayScore,
              venue: match.venue,
              country: match.country,
              streamUrl: match.streamUrl,
              metadata: match.metadata,
              sportId: sport.id,
              leagueId: leagueId,
              homeTeamId: homeTeamId,
              awayTeamId: awayTeamId
            }
          });
          console.log(`  ✅ Created match: ${match.homeTeam} vs ${match.awayTeam}`);
        }
      }
    }
    
    // 8. Sync some sample posts
    console.log('\n📝 Syncing Sample Posts...');
    const localPosts = await localPrisma.post.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      where: { isDeleted: false }
    });
    
    for (const post of localPosts) {
      // Check if user exists in production
      const localUser = await localPrisma.user.findUnique({ where: { id: post.userId }});
      if (localUser) {
        let prodUser = await prodPrisma.user.findUnique({ where: { email: localUser.email }});
        
        if (!prodUser) {
          // Create user if doesn't exist
          prodUser = await prodPrisma.user.create({
            data: {
              email: localUser.email,
              username: localUser.username,
              password: localUser.password,
              role: localUser.role,
              level: localUser.level,
              experience: localUser.experience,
              isActive: localUser.isActive
            }
          });
          console.log(`  ✅ Created user: ${prodUser.username}`);
        }
        
        // Get category in production
        const localCategory = await localPrisma.boardCategory.findUnique({ where: { id: post.categoryId }});
        const prodCategory = await prodPrisma.boardCategory.findUnique({ where: { slug: localCategory!.slug }});
        
        if (prodCategory) {
          const exists = await prodPrisma.post.findFirst({
            where: {
              title: post.title,
              userId: prodUser.id
            }
          });
          
          if (!exists) {
            await prodPrisma.post.create({
              data: {
                title: post.title,
                content: post.content,
                userId: prodUser.id,
                categoryId: prodCategory.id,
                views: post.views,
                isPinned: post.isPinned,
                isDeleted: post.isDeleted,
                metadata: post.metadata
              }
            });
            console.log(`  ✅ Created post: ${post.title.substring(0, 30)}...`);
          }
        }
      }
    }
    
    console.log('\n✨ Data synchronization completed successfully!');
    
    // Show final counts
    console.log('\n📊 Production Database Final Counts:');
    const finalPartners = await prodPrisma.partner.count();
    const finalPosts = await prodPrisma.post.count();
    const finalMatches = await prodPrisma.match.count();
    const finalUsers = await prodPrisma.user.count();
    const finalCategories = await prodPrisma.boardCategory.count();
    
    console.log(`  Partners: ${finalPartners}`);
    console.log(`  Posts: ${finalPosts}`);
    console.log(`  Matches: ${finalMatches}`);
    console.log(`  Users: ${finalUsers}`);
    console.log(`  Categories: ${finalCategories}`);
    
  } catch (error) {
    console.error('❌ Error during synchronization:', error);
  } finally {
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the sync
syncData();
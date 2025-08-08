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
  console.log('🚀 Starting SAFE data synchronization from local to production...\n');
  
  try {
    // 1. Sync Board Categories
    console.log('📋 Syncing Board Categories...');
    const localCategories = await localPrisma.boardCategory.findMany();
    for (const category of localCategories) {
      try {
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
        } else {
          console.log(`  ⏭️  Category already exists: ${category.name}`);
        }
      } catch (error: any) {
        console.log(`  ⚠️  Error creating category ${category.name}: ${error.message}`);
      }
    }
    
    // 2. Get or create admin user
    console.log('\n👤 Ensuring admin user exists...');
    let adminUser = await prodPrisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      const localAdmin = await localPrisma.user.findFirst({
        where: { role: 'ADMIN' }
      });
      
      if (localAdmin) {
        // Check if user exists by email
        adminUser = await prodPrisma.user.findUnique({
          where: { email: localAdmin.email }
        });
        
        if (!adminUser) {
          try {
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
          } catch (error: any) {
            console.log(`  ⚠️  Error creating admin user: ${error.message}`);
            // Try to find any user to use as creator
            adminUser = await prodPrisma.user.findFirst();
          }
        }
      }
    }
    
    if (!adminUser) {
      console.log('  ❌ No admin user available, skipping partner creation');
      return;
    }
    
    // 3. Sync Partners
    console.log('\n🤝 Syncing Partners...');
    const localPartners = await localPrisma.partner.findMany({
      where: { isActive: true }
    });
    
    let partnersCreated = 0;
    let partnersSkipped = 0;
    
    for (const partner of localPartners) {
      try {
        const exists = await prodPrisma.partner.findUnique({
          where: { name: partner.name }
        });
        
        if (!exists) {
          await prodPrisma.partner.create({
            data: {
              name: partner.name,
              description: partner.description,
              detailContent: partner.detailContent || `${partner.description}\n\n상세 정보는 준비 중입니다.`,
              websiteUrl: partner.websiteUrl,
              bannerImage: partner.bannerImage || '',
              isActive: partner.isActive,
              viewCount: partner.viewCount || 0,
              createdBy: adminUser.id
            }
          });
          console.log(`  ✅ Created partner: ${partner.name}`);
          partnersCreated++;
        } else {
          partnersSkipped++;
        }
      } catch (error: any) {
        console.log(`  ⚠️  Error creating partner ${partner.name}: ${error.message}`);
      }
    }
    console.log(`  📊 Partners: ${partnersCreated} created, ${partnersSkipped} skipped`);
    
    // 4. Sync Sports
    console.log('\n⚽ Syncing Sports...');
    const localSports = await localPrisma.sport.findMany();
    for (const sport of localSports) {
      try {
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
      } catch (error: any) {
        console.log(`  ⚠️  Error creating sport ${sport.nameKo}: ${error.message}`);
      }
    }
    
    // 5. Sync Leagues
    console.log('\n🏆 Syncing Leagues...');
    const localLeagues = await localPrisma.league.findMany();
    for (const league of localLeagues) {
      try {
        const localSport = await localPrisma.sport.findUnique({ where: { id: league.sportId }});
        if (!localSport) continue;
        
        const sport = await prodPrisma.sport.findUnique({
          where: { slug: localSport.slug }
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
      } catch (error: any) {
        console.log(`  ⚠️  Error creating league ${league.nameKo}: ${error.message}`);
      }
    }
    
    // 6. Sync Teams
    console.log('\n👥 Syncing Teams...');
    const localTeams = await localPrisma.team.findMany();
    for (const team of localTeams) {
      try {
        const localSport = await localPrisma.sport.findUnique({ where: { id: team.sportId }});
        if (!localSport) continue;
        
        const sport = await prodPrisma.sport.findUnique({
          where: { slug: localSport.slug }
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
      } catch (error: any) {
        console.log(`  ⚠️  Error creating team ${team.nameKo}: ${error.message}`);
      }
    }
    
    // 7. Sync Recent Matches
    console.log('\n📅 Syncing Matches...');
    const localMatches = await localPrisma.match.findMany({
      take: 20,
      orderBy: { scheduledTime: 'desc' }
    });
    
    let matchesCreated = 0;
    for (const match of localMatches) {
      try {
        const exists = await prodPrisma.match.findFirst({
          where: {
            homeTeam: match.homeTeam,
            awayTeam: match.awayTeam,
            scheduledTime: match.scheduledTime
          }
        });
        
        if (!exists) {
          // Get sport, league, and teams if they exist
          let sportId = null;
          let leagueId = null;
          let homeTeamId = null;
          let awayTeamId = null;
          
          if (match.sportId) {
            const localSport = await localPrisma.sport.findUnique({ where: { id: match.sportId }});
            if (localSport) {
              const prodSport = await prodPrisma.sport.findUnique({ where: { slug: localSport.slug }});
              sportId = prodSport?.id || null;
            }
          }
          
          if (match.leagueId && sportId) {
            const localLeague = await localPrisma.league.findUnique({ where: { id: match.leagueId }});
            if (localLeague) {
              const prodLeague = await prodPrisma.league.findFirst({
                where: { slug: localLeague.slug, sportId: sportId }
              });
              leagueId = prodLeague?.id || null;
            }
          }
          
          if (match.homeTeamId && sportId) {
            const localTeam = await localPrisma.team.findUnique({ where: { id: match.homeTeamId }});
            if (localTeam) {
              const prodTeam = await prodPrisma.team.findFirst({
                where: { slug: localTeam.slug, sportId: sportId }
              });
              homeTeamId = prodTeam?.id || null;
            }
          }
          
          if (match.awayTeamId && sportId) {
            const localTeam = await localPrisma.team.findUnique({ where: { id: match.awayTeamId }});
            if (localTeam) {
              const prodTeam = await prodPrisma.team.findFirst({
                where: { slug: localTeam.slug, sportId: sportId }
              });
              awayTeamId = prodTeam?.id || null;
            }
          }
          
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
              sportId: sportId,
              leagueId: leagueId,
              homeTeamId: homeTeamId,
              awayTeamId: awayTeamId
            }
          });
          console.log(`  ✅ Created match: ${match.homeTeam} vs ${match.awayTeam}`);
          matchesCreated++;
        }
      } catch (error: any) {
        console.log(`  ⚠️  Error creating match: ${error.message}`);
      }
    }
    console.log(`  📊 Matches: ${matchesCreated} created`);
    
    // 8. Sync some sample posts
    console.log('\n📝 Syncing Sample Posts...');
    const localPosts = await localPrisma.post.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { isDeleted: false }
    });
    
    let postsCreated = 0;
    for (const post of localPosts) {
      try {
        const localUser = await localPrisma.user.findUnique({ where: { id: post.userId }});
        if (!localUser) continue;
        
        let prodUser = await prodPrisma.user.findUnique({ where: { email: localUser.email }});
        
        if (!prodUser) {
          try {
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
          } catch (error) {
            continue; // Skip if can't create user
          }
        }
        
        const localCategory = await localPrisma.boardCategory.findUnique({ where: { id: post.categoryId }});
        if (!localCategory) continue;
        
        const prodCategory = await prodPrisma.boardCategory.findUnique({ where: { slug: localCategory.slug }});
        
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
            postsCreated++;
          }
        }
      } catch (error: any) {
        console.log(`  ⚠️  Error creating post: ${error.message}`);
      }
    }
    console.log(`  📊 Posts: ${postsCreated} created`);
    
    console.log('\n✨ Data synchronization completed!');
    
    // Show final counts
    console.log('\n📊 Production Database Final Counts:');
    const finalPartners = await prodPrisma.partner.count();
    const finalPosts = await prodPrisma.post.count();
    const finalMatches = await prodPrisma.match.count();
    const finalUsers = await prodPrisma.user.count();
    const finalCategories = await prodPrisma.boardCategory.count();
    const finalSports = await prodPrisma.sport.count();
    const finalLeagues = await prodPrisma.league.count();
    const finalTeams = await prodPrisma.team.count();
    
    console.log(`  Partners: ${finalPartners}`);
    console.log(`  Posts: ${finalPosts}`);
    console.log(`  Matches: ${finalMatches}`);
    console.log(`  Sports: ${finalSports}`);
    console.log(`  Leagues: ${finalLeagues}`);
    console.log(`  Teams: ${finalTeams}`);
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
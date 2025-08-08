// Test the API locally to see if it works
async function testLocalAPI() {
  console.log('🔍 Testing Analysis API locally...\n');
  
  try {
    // Test local API
    const localUrl = 'http://localhost:3000/api/analysis';
    console.log(`Testing local: ${localUrl}`);
    
    const localResponse = await fetch(localUrl);
    const localData = await localResponse.json();
    
    console.log(`Local Status: ${localResponse.status}`);
    console.log(`Local Response:`, JSON.stringify(localData, null, 2));
    
    if (localData.success && localData.data) {
      console.log(`\n✅ Local API works! Found ${localData.data.analyses.length} analyses`);
    } else {
      console.log(`\n❌ Local API returned error:`, localData.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing local:', error);
  }
}

// Run the test
testLocalAPI();
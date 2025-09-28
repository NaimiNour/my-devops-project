require('dotenv').config();
const B2 = require('backblaze-b2');

console.log('🧪 Testing B2 Connection...');
console.log('B2_APP_KEY_ID:', process.env.B2_APP_KEY_ID ? 
  process.env.B2_APP_KEY_ID.substring(0, 8) + '...' : 'NOT_SET');

if (!process.env.B2_APP_KEY_ID || !process.env.B2_APP_KEY) {
  console.error('❌ B2 credentials not set in .env file');
  process.exit(1);
}

const b2 = new B2({
  applicationKeyId: process.env.B2_APP_KEY_ID,
  applicationKey: process.env.B2_APP_KEY
});

async function testB2() {
  try {
    console.log('🔄 Attempting B2 authorization...');
    const authResponse = await b2.authorize();
    console.log('✅ B2 Authorization successful!');
    console.log('Account ID:', authResponse.data.accountId);
    
    // Test listing buckets
    console.log('🔄 Listing buckets...');
    const bucketsResponse = await b2.listBuckets();
    console.log('✅ Found', bucketsResponse.data.buckets.length, 'buckets');
    
    bucketsResponse.data.buckets.forEach(bucket => {
      console.log(`  - ${bucket.bucketName} (${bucket.bucketId})`);
    });
    
    // Check if our bucket exists
    const ourBucket = bucketsResponse.data.buckets.find(
      b => b.bucketId === process.env.B2_BUCKET_ID
    );
    
    if (ourBucket) {
      console.log('✅ Target bucket found:', ourBucket.bucketName);
    } else {
      console.log('❌ Target bucket NOT found with ID:', process.env.B2_BUCKET_ID);
    }
    
  } catch (error) {
    console.error('❌ B2 Connection failed:');
    console.error('Error:', error.message);
    console.error('Status:', error.status);
    
    if (error.status === 401) {
      console.error('💡 This is likely incorrect B2 credentials');
    }
  }
}

testB2();